#!/usr/bin/env python3
"""Enrich and disambiguate corpus authors from publication-linked records.

The script never matches an author by name alone. It starts from a paper already
in the corpus, resolves that paper in OpenAlex and Semantic Scholar, and then
matches author records within the resolved publication. Raw responses are cached
under imports/, which is intentionally excluded from Git.

Google Scholar profiles are recorded only when a trusted profile source already
contains a public scholar.google.com/citations URL. The script does not scrape
Google Scholar search results or collect mutable citation metrics.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import http.client
import json
import re
import ssl
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
PAPERS_DIR = ROOT / "data" / "papers"
AUTHORS_PATH = ROOT / "data" / "authors.yaml"
CACHE_DIR = ROOT / "imports" / "author-enrichment-cache"
REPORT_PATH = ROOT / "imports" / "author-enrichment-report.json"
USER_AGENT = "LLM-Interpretability-KB/1.0 (author metadata audit)"
WIKIDATA_PROPERTY_BY_EXTERNAL_ID = {
    "orcid": "P496",
    "openalex": "P10283",
    "semantic_scholar": "P4012",
}

# Confirmed by identical publication-linked OpenAlex identities. Paper records
# use the canonical target IDs; legacy names are retained as aliases.
AUTHOR_MERGES = {
    "a_f_wei_7272583e": "a_furu_wei_3dab2ed7",
    "a_janos_kramar_6ba94ff0": "a_j_anos_kram_ar_813930c3",
    "a_m_wattenberg_127591b0": "a_martin_wattenberg_6df204a2",
}

MANUAL_AUTHOR_OVERRIDES = {
    "a_david_bau_778385a5": {
        "openalex": "A5033305045",
        "semantic_scholar": "144159726",
        "affiliation": "Northeastern University",
        "affiliation_source": "https://www.khoury.northeastern.edu/people/david-bau/",
        "homepage": "https://baulab.info/",
        "google_scholar": "https://scholar.google.com/citations?user=CYI6cKgAAAAJ&hl=en",
        "note": "Reviewed against the current Northeastern faculty page and the author's homepage.",
    },
    "a_yonatan_belinkov_efb645ca": {
        "openalex": "A5051184573",
        "semantic_scholar": "2083259",
        "affiliation": "Technion – Israel Institute of Technology",
        "affiliation_source": "https://belinkov.com/",
        "homepage": "https://belinkov.com/",
        "google_scholar": "https://scholar.google.com/citations?user=K-6ujU4AAAAJ&hl=en",
        "note": "Reviewed against the author's current homepage and publication list.",
    },
}

# High-confidence profile links found by targeted web search. Each entry was
# checked against a known corpus publication and the author's own or official
# institutional page. These are kept in the script so a later refresh does not
# erase manually verified links.
MANUAL_PROFILE_OVERRIDES = {
    "a_aaron_mueller_4e73fa7c": {
        "homepage": "https://aaronmueller.github.io/",
        "source_url": "https://aaronmueller.github.io/",
        "affiliations": ["Boston University"],
    },
    "a_a_globerson_21f40668": {
        "google_scholar": "https://scholar.google.com/citations?user=5JserkUAAAAJ&hl=en",
        "source_url": "https://research.google/people/amirgloberson/",
    },
    "a_aaditya_k_singh_09be1a75": {
        "homepage": "https://aadityasingh.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=9OPKqmMAAAAJ&hl=en",
        "source_url": "https://www.saxelab.org/people",
    },
    "a_adam_scherlis_6f60c160": {
        "google_scholar": "https://scholar.google.com/citations?user=3i50nQ0AAAAJ&hl=en",
        "source_url": "https://www.newx.sg/scholar/3i50nQ0AAAAJ",
    },
    "a_adria_garriga_alonso_87077a5e": {
        "homepage": "https://adriaga.com/",
        "google_scholar": "https://scholar.google.com/citations?user=OtnThiMAAAAJ&hl=en",
        "source_url": "https://adriaga.com/",
    },
    "a_aleksandar_makelov_cff58185": {
        "homepage": "https://amakelov.github.io/",
        "source_url": "https://toc.csail.mit.edu/user/273",
    },
    "a_alessandro_stolfo_195681bf": {
        "homepage": "https://alestolfo.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=Fx50TZQAAAAJ&hl=en",
        "source_url": "https://alestolfo.github.io/",
    },
    "a_alexandre_variengien_34d668db": {
        "homepage": "https://alexandrevariengien.com/",
        "google_scholar": "https://scholar.google.com/citations?user=BQOwWG8AAAAJ&hl=en",
        "source_url": "https://alexandrevariengien.com/",
    },
    "a_anka_reuel_8b134874": {
        "google_scholar": "https://scholar.google.com/citations?user=ysb8XywAAAAJ&hl=en",
        "source_url": "https://newx.sg/scholar/ysb8XywAAAAJ",
    },
    "a_arthur_conmy_1734e7d3": {
        "homepage": "https://arthurconmy.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=n4HIyXQAAAAJ&hl=en",
        "source_url": "https://arthurconmy.github.io/",
        "affiliations": ["Anthropic"],
    },
    "a_asma_ghandeharioun_32ccce58": {
        "homepage": "https://asmadotgh.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=CkfQy2gAAAAJ&hl=en",
        "source_url": "https://asmadotgh.github.io/",
        "affiliations": ["Google DeepMind"],
    },
    "a_atticus_geiger_e76a395b": {
        "homepage": "https://atticusg.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=w2Qzno8AAAAJ&hl=en",
        "source_url": "https://atticusg.github.io/",
        "affiliations": ["Goodfire"],
    },
    "a_bin_yu_34f3b0ee": {
        "homepage": "https://binyu.stat.berkeley.edu/",
        "google_scholar": "https://scholar.google.com/citations?user=xT19Jc0AAAAJ&hl=en",
        "source_url": "https://vcresearch.berkeley.edu/faculty/bin-yu",
        "affiliations": ["University of California, Berkeley"],
    },
    "a_buck_shlegeris_a997ed75": {
        "homepage": "https://www.shlegeris.com/",
        "source_url": "https://www.shlegeris.com/",
        "affiliations": ["Redwood Research"],
    },
    "a_chris_olah_158a0d46": {
        "homepage": "https://colah.github.io/",
        "source_url": "https://colah.github.io/",
    },
    "a_christopher_potts_f9424ce1": {
        "homepage": "https://stanford.edu/~cgpotts/",
        "google_scholar": "https://scholar.google.com/citations?user=3j08YoAAAAAJ&hl=en",
        "source_url": "https://stanford.edu/~cgpotts/",
    },
    "a_c_s_de_witt_0896a1f0": {
        "homepage": "https://wittlab.ai/people/christian-schroeder-de-witt/",
        "google_scholar": "https://scholar.google.com/citations?user=DE60h_0AAAAJ&hl=en",
        "source_url": "https://wittlab.ai/people/christian-schroeder-de-witt/",
    },
    "a_curt_tigges_55c44e00": {
        "homepage": "https://www.curttigges.com/",
        "source_url": "https://www.curttigges.com/",
        "affiliations": ["Goodfire"],
    },
    "a_dan_hendrycks_077a839f": {
        "homepage": "https://danhendrycks.com/",
        "google_scholar": "https://scholar.google.com/citations?user=czyretsAAAAJ&hl=en",
        "source_url": "https://danhendrycks.com/",
        "affiliations": ["Center for AI Safety"],
    },
    "a_fazl_barez_a240fb67": {
        "homepage": "https://fazlbarez.com/",
        "google_scholar": "https://scholar.google.com/citations?user=EAjpNIMAAAAJ&hl=en",
        "source_url": "https://fazlbarez.com/",
    },
    "a_i_oseledets_0ac70951": {
        "homepage": "https://oseledets.github.io/people/oseledets/",
        "source_url": "https://dblp.org/pid/56/7175.html",
        "external_ids": {"orcid": "0000-0003-2071-2163"},
        "affiliations": ["Skolkovo Institute of Science and Technology"],
    },
    "a_jacob_steinhardt_bd43f01f": {
        "homepage": "https://jsteinhardt.stat.berkeley.edu/",
        "source_url": "https://jsteinhardt.stat.berkeley.edu/",
        "affiliations": ["University of California, Berkeley", "Transluce"],
    },
    "a_javier_ferrando_abb97346": {
        "homepage": "https://javiferran.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=ZNsw8ZUAAAAJ&hl=en",
        "source_url": "https://javiferran.github.io/",
        "affiliations": ["Amazon"],
    },
    "a_jack_merullo_5e5b2b61": {
        "homepage": "https://jmerullo.github.io/",
        "source_url": "https://jmerullo.github.io/",
        "affiliations": ["Goodfire"],
    },
    "a_ji_rong_wen_c5fe13c0": {
        "homepage": "https://gsai.ruc.edu.cn/addons/teacher/index/info.html?ln=en&user_id=30",
        "google_scholar": "https://scholar.google.com/citations?user=tbxCHJgAAAAJ&hl=en",
        "source_url": "https://gsai.ruc.edu.cn/addons/teacher/index/info.html?ln=en&user_id=30",
        "affiliations": ["Renmin University of China"],
    },
    "a_jing_huang_190343e2": {
        "homepage": "https://explanare.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=zM_wp_MAAAAJ&hl=en",
        "source_url": "https://explanare.github.io/",
    },
    "a_j_bloom_aff35e1c": {
        "homepage": "https://www.jbloomaus.com/about/",
        "source_url": "https://www.aisi.gov.uk/research/loss-of-oversight-how-ai-systems-may-become-harder-to-audit-monitor-and-investigate",
        "affiliations": ["UK AI Security Institute"],
    },
    "a_jason_d_lee_962bcae5": {
        "homepage": "https://jasondlee88.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=GR_DsT0AAAAJ&hl=en",
        "source_url": "https://jasondlee88.github.io/",
        "affiliations": ["University of California, Berkeley"],
    },
    "a_lee_sharkey_9047958a": {
        "homepage": "https://leesharkey.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=ZzXikBsAAAAJ&hl=en",
        "source_url": "https://www.hmc.ox.ac.uk/people/lee-sharkey",
    },
    "a_martin_wattenberg_6df204a2": {
        "homepage": "https://www.bewitched.com/",
        "google_scholar": "https://scholar.google.com/citations?user=pv54dqMAAAAJ&hl=en",
        "source_url": "https://www.bewitched.com/",
    },
    "a_max_lamparth_90e0b0c0": {
        "homepage": "https://www.maxlamparth.com/",
        "google_scholar": "https://scholar.google.com/citations?user=snC9WF4AAAAJ&hl=en",
        "source_url": "https://cap.stanford.edu/profiles/frdActionServlet?choiceId=printerprofile&profileId=326201&profileversion=full",
        "affiliations": ["Stanford University"],
    },
    "a_mrinmaya_sachan_05339d14": {
        "homepage": "https://www.mrinmaya.io/",
        "source_url": "https://ellis.eu/person/mrinmaya-sachan",
        "affiliations": ["ETH Zurich"],
    },
    "a_neel_nanda_ddf6abf4": {
        "homepage": "https://www.neelnanda.io/",
        "google_scholar": "https://scholar.google.com/citations?user=GLnX3MkAAAAJ&hl=en",
        "source_url": "https://www.neelnanda.io/about",
        "affiliations": ["Google DeepMind"],
    },
    "a_nelson_elhage_f370d8f0": {
        "homepage": "https://nelhage.com/",
        "source_url": "https://nelhage.com/",
    },
    "a_p_liang_afb804cb": {
        "homepage": "https://pliang279.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=pKf5LtQAAAAJ&hl=en",
        "source_url": "https://pliang279.github.io/",
        "affiliations": ["Massachusetts Institute of Technology"],
    },
    "a_p_jyothi_119ee646": {
        "homepage": "https://www.cse.iitb.ac.in/~pjyothi/",
        "source_url": "https://www.cse.iitb.ac.in/~pjyothi/",
        "affiliations": ["Indian Institute of Technology Bombay"],
    },
    "a_peter_hase_d937a33d": {
        "homepage": "https://peterbhase.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=FO90FgMAAAAJ&hl=en",
        "source_url": "https://peterbhase.github.io/",
        "affiliations": ["Stanford University", "Schmidt Sciences"],
    },
    "a_rohin_shah_1b05662e": {
        "homepage": "https://rohinshah.com/",
        "source_url": "https://rohinshah.com/",
        "affiliations": ["Google DeepMind"],
    },
    "a_samuel_marks_46475651": {
        "homepage": "https://people.math.harvard.edu/~smarks/",
        "source_url": "https://people.math.harvard.edu/~smarks/",
    },
    "a_sarah_schwettmann_75d9e5ed": {
        "homepage": "https://www.cogconfluence.com/",
        "source_url": "https://cbmm.mit.edu/about/people/schwettmann",
    },
    "a_senthooran_rajamanoharan_77c86f94": {
        "google_scholar": "https://scholar.google.com/citations?user=W4JthzgAAAAJ&hl=en",
        "source_url": "https://www.newx.sg/scholar/W4JthzgAAAAJ",
    },
    "a_thang_bui_f266eb37": {
        "homepage": "https://thangbui.github.io/",
        "google_scholar": "https://scholar.google.com/citations?user=SVq3y1sAAAAJ&hl=en",
        "source_url": "https://comp.anu.edu.au/people/thang-bui/",
        "external_ids": {"orcid": "0000-0002-7878-9748"},
        "affiliations": ["Australian National University"],
    },
    "a_thomas_f_icard_e9a57f00": {
        "homepage": "https://stanford.edu/~icard/",
        "source_url": "https://stanford.edu/~icard/",
        "affiliations": ["Stanford University", "Goodfire"],
    },
    "a_t_henighan_26ac86d7": {
        "homepage": "https://www.tomhenighan.com/",
        "google_scholar": "https://scholar.google.com/citations?user=8h3AFugAAAAJ&hl=en",
        "source_url": "https://scholar.google.com/citations?user=8h3AFugAAAAJ&hl=en",
        "affiliations": ["Anthropic"],
    },
    "a_tom_lieberum_e979b353": {
        "homepage": "https://tomfrederik.github.io/",
        "source_url": "https://tomfrederik.github.io/",
    },
    "a_vasudev_lal_d72bef4a": {
        "homepage": "http://www-personal.umich.edu/~vasudev/projectHub/",
        "source_url": "https://www.linkedin.com/in/vasudev-lal-79bb336",
        "affiliations": ["Oracle"],
    },
    "a_victor_veitch_33c2c5da": {
        "homepage": "https://www.victorveitch.com/",
        "google_scholar": "https://scholar.google.com/citations?user=xkn_XZgAAAAJ&hl=en",
        "source_url": "https://www.victorveitch.com/",
        "affiliations": ["University of Chicago", "Google DeepMind"],
    },
    "a_vikrant_varma_fcdf9a6c": {
        "homepage": "https://cse.iitkgp.ac.in/~vvarma/",
        "source_url": "https://cse.iitkgp.ac.in/~vvarma/",
        "affiliations": ["Google DeepMind"],
    },
    "a_vladimir_pavlovic_0e95a443": {
        "homepage": "https://seqamlab.com/",
        "google_scholar": "https://scholar.google.com/citations?user=8MQT8skAAAAJ&hl=en",
        "source_url": "https://www.cs.rutgers.edu/people/professors/details/vladimir-pavlovic",
        "external_ids": {"orcid": "0000-0003-3979-1236"},
        "affiliations": ["Rutgers University"],
    },
    "a_virginia_smith_c526985b": {
        "homepage": "https://www.cs.cmu.edu/~smithv/",
        "google_scholar": "https://scholar.google.com/citations?user=bldHpWIAAAAJ&hl=en",
        "source_url": "https://engineering.cmu.edu/directory/bios/smith-virginia.html",
        "affiliations": ["Carnegie Mellon University"],
    },
    "a_wes_gurnee_bef85191": {
        "homepage": "https://wesg.me/",
        "source_url": "https://wesg.me/",
    },
    "a_zhengxuan_wu_9418211c": {
        "homepage": "https://cs.stanford.edu/~wuzhengx/",
        "google_scholar": "https://scholar.google.com/citations?user=ta7rCJAAAAAJ&hl=en",
        "source_url": "https://cs.stanford.edu/~wuzhengx/",
        "affiliations": ["Google DeepMind"],
    },
}


def normalize_text(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return "".join(ch.lower() for ch in value if ch.isalnum())


def name_tokens(value: str | None) -> list[str]:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.findall(r"[a-z0-9]+", value.lower())


def scholar_url(value: str | None) -> str | None:
    if not value:
        return None
    parsed = urllib.parse.urlparse(value)
    if parsed.netloc.lower() not in {"scholar.google.com", "scholar.googleusercontent.com"}:
        return None
    if parsed.path != "/citations":
        return None
    query = urllib.parse.parse_qs(parsed.query)
    user = query.get("user", query.get("authorid", [None]))[0]
    if not user:
        return None
    return f"https://scholar.google.com/citations?user={urllib.parse.quote(user)}&hl=en"


def cache_path(namespace: str, key: str) -> Path:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return CACHE_DIR / namespace / f"{digest}.json"


def fetch_json(
    namespace: str, url: str, *, retries: int = 5, timeout: int = 30
) -> dict[str, Any] | None:
    target = cache_path(namespace, url)
    if target.exists():
        return json.loads(target.read_text(encoding="utf-8"))

    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                payload = json.load(response)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            time.sleep(0.12)
            return payload
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                return None
            if exc.code != 429 and exc.code < 500:
                raise
            time.sleep(2**attempt)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            time.sleep(2**attempt)
    return None


def fetch_json_post(
    namespace: str, url: str, payload: dict[str, Any], *, retries: int = 5
) -> Any:
    body = json.dumps(payload, sort_keys=True).encode("utf-8")
    key = url + "\n" + body.decode("utf-8")
    target = cache_path(namespace, key)
    if target.exists():
        return json.loads(target.read_text(encoding="utf-8"))
    request = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                result = json.load(response)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
            return result
        except urllib.error.HTTPError as exc:
            if exc.code != 429 and exc.code < 500:
                raise
            time.sleep(2**attempt)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            time.sleep(2**attempt)
    return None


def fetch_text(namespace: str, url: str, *, retries: int = 3) -> str | None:
    target = cache_path(namespace, url).with_suffix(".html")
    if target.exists():
        return target.read_text(encoding="utf-8", errors="replace")
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                content_type = response.headers.get("Content-Type", "")
                if "html" not in content_type.lower():
                    return None
                body = response.read(2_000_000)
            text = body.decode("utf-8", errors="replace")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text, encoding="utf-8")
            return text
        except (
            urllib.error.HTTPError,
            urllib.error.URLError,
            http.client.HTTPException,
            ssl.SSLError,
            TimeoutError,
            OSError,
        ):
            time.sleep(2**attempt)
    return None


def load_papers() -> list[dict[str, Any]]:
    return [yaml.safe_load(path.read_text(encoding="utf-8")) for path in sorted(PAPERS_DIR.glob("*.yaml"))]


def merge_confirmed_author_records(authors: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    authors = dict(authors)
    for legacy_id, canonical_id in AUTHOR_MERGES.items():
        legacy = authors.pop(legacy_id, None)
        canonical = authors.get(canonical_id)
        if not legacy or not canonical:
            continue
        aliases = set(canonical.get("aliases", []))
        aliases.add(legacy["canonical_name"])
        aliases.update(legacy.get("aliases", []))
        aliases.discard(canonical["canonical_name"])
        canonical["aliases"] = sorted(aliases, key=str.casefold)
    return authors


def work_url_openalex(paper: dict[str, Any]) -> str | None:
    doi = paper.get("identifiers", {}).get("doi")
    arxiv_id = paper.get("identifiers", {}).get("arxiv_id")
    if doi:
        identifier = f"https://doi.org/{doi}"
    elif arxiv_id:
        identifier = f"https://doi.org/10.48550/arxiv.{arxiv_id}"
    else:
        return None
    return "https://api.openalex.org/works/" + urllib.parse.quote(identifier, safe="")


def work_id_s2(paper: dict[str, Any]) -> str | None:
    doi = paper.get("identifiers", {}).get("doi")
    arxiv_id = paper.get("identifiers", {}).get("arxiv_id")
    if doi:
        return f"DOI:{doi}"
    elif arxiv_id:
        return f"ARXIV:{arxiv_id}"
    return None


def match_authors(
    paper: dict[str, Any], external_authors: list[dict[str, Any]], id_key: str
) -> list[tuple[str, str]]:
    """Return local-author-id/external-author-id pairs with conservative matching."""
    local_authors = paper["authors"]
    pairs: list[tuple[str, str]] = []
    used_external: set[int] = set()

    for local in local_authors:
        local_name = normalize_text(local["name"])
        exact = [
            index
            for index, external in enumerate(external_authors)
            if index not in used_external and normalize_text(external.get("name") or external.get("display_name")) == local_name
        ]
        chosen: int | None = exact[0] if len(exact) == 1 else None

        if chosen is None and len(local_authors) == len(external_authors):
            index = local["position"] - 1
            if 0 <= index < len(external_authors) and index not in used_external:
                external_name = normalize_text(
                    external_authors[index].get("name") or external_authors[index].get("display_name")
                )
                local_parts = name_tokens(local["name"])
                external_parts = name_tokens(
                    external_authors[index].get("name")
                    or external_authors[index].get("display_name")
                )
                if local_parts and external_parts and local_parts[-1] == external_parts[-1]:
                    chosen = index

        if chosen is None:
            continue
        external_id = external_authors[chosen].get(id_key)
        if external_id:
            pairs.append((local["author_id"], str(external_id).rsplit("/", 1)[-1]))
            used_external.add(chosen)
    return pairs


def collect_publication_matches(
    papers: list[dict[str, Any]], *, include_semantic_scholar: bool
) -> tuple[dict[str, Any], dict[str, Any]]:
    openalex: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    s2: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    failures = {"openalex": [], "semantic_scholar": []}

    def resolve_paper(paper: dict[str, Any]) -> tuple[str, list[tuple[str, str]], bool]:
        paper_id = paper["paper_id"]
        oa_url = work_url_openalex(paper)
        oa_work = fetch_json("openalex-works", oa_url) if oa_url else None
        oa_pairs: list[tuple[str, str]] = []
        if oa_work:
            external = [
                {
                    "id": item.get("author", {}).get("id"),
                    "display_name": item.get("author", {}).get("display_name"),
                }
                for item in oa_work.get("authorships", [])
            ]
            oa_pairs = match_authors(paper, external, "id")

        return paper_id, oa_pairs, oa_work is not None

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(resolve_paper, paper) for paper in papers]
        for number, future in enumerate(as_completed(futures), start=1):
            paper_id, oa_pairs, has_oa = future.result()
            for local_id, external_id in oa_pairs:
                openalex[local_id][external_id].add(paper_id)
            if not has_oa:
                failures["openalex"].append(paper_id)
            if number % 20 == 0:
                print(f"resolved {number}/{len(papers)} corpus papers", flush=True)

    if include_semantic_scholar:
        s2_ids = [work_id_s2(paper) for paper in papers]
        payload_ids = [identifier for identifier in s2_ids if identifier]
        url = "https://api.semanticscholar.org/graph/v1/paper/batch?fields=title,authors"
        results = fetch_json_post("s2-works-batch", url, {"ids": payload_ids}) or []
        result_iter = iter(results)
        for paper, identifier in zip(papers, s2_ids):
            work = next(result_iter, None) if identifier else None
            if not work:
                failures["semantic_scholar"].append(paper["paper_id"])
                continue
            pairs = match_authors(paper, work.get("authors", []), "authorId")
            for local_id, external_id in pairs:
                s2[local_id][external_id].add(paper["paper_id"])

    return {"openalex": openalex, "semantic_scholar": s2}, failures


def author_openalex(author_id: str) -> dict[str, Any] | None:
    return fetch_json("openalex-authors", f"https://api.openalex.org/authors/{author_id}")


def authors_s2_batch(author_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not author_ids:
        return {}
    fields = "name,url,affiliations,homepage,externalIds"
    url = f"https://api.semanticscholar.org/graph/v1/author/batch?fields={fields}"
    records: dict[str, dict[str, Any]] = {}
    for offset in range(0, len(author_ids), 500):
        chunk = author_ids[offset : offset + 500]
        rows = fetch_json_post("s2-authors-batch", url, {"ids": chunk}) or []
        for row in rows:
            if row and row.get("authorId"):
                records[str(row["authorId"])] = row
    return records


def wikidata_rows(property_id: str, values: list[str]) -> dict[str, list[dict[str, str]]]:
    """Resolve stable external IDs to Wikidata profile links in small batches."""
    records: dict[str, list[dict[str, str]]] = defaultdict(list)
    for offset in range(0, len(values), 500):
        chunk = values[offset : offset + 500]
        literals = " ".join(json.dumps(value) for value in chunk)
        query = f"""
SELECT ?person ?lookup ?website ?scholar WHERE {{
  VALUES ?lookup {{ {literals} }}
  ?person wdt:{property_id} ?lookup .
  OPTIONAL {{ ?person wdt:P856 ?website . }}
  OPTIONAL {{ ?person wdt:P1960 ?scholar . }}
}}
""".strip()
        url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode(
            {"query": query, "format": "json"}
        )
        payload = fetch_json("wikidata-sparql", url, retries=3, timeout=90) or {}
        for binding in payload.get("results", {}).get("bindings", []):
            lookup = binding.get("lookup", {}).get("value")
            person = binding.get("person", {}).get("value")
            if not lookup or not person:
                continue
            row = {"person": person}
            website = binding.get("website", {}).get("value")
            scholar = binding.get("scholar", {}).get("value")
            if website:
                row["website"] = website
            if scholar:
                row["scholar"] = scholar
            records[lookup].append(row)
    return records


def collect_wikidata_profiles(
    authors: dict[str, dict[str, Any]], matches: dict[str, Any]
) -> dict[str, dict[str, Any]]:
    """Find profile links only when Wikidata agrees with a known stable author ID."""
    lookups_by_author: dict[str, dict[str, str]] = {}
    values_by_namespace: dict[str, set[str]] = defaultdict(set)
    for local_id, current in authors.items():
        external_ids = dict(current.get("external_ids", {}))
        for namespace in ("openalex", "semantic_scholar"):
            candidates = matches[namespace].get(local_id, {})
            if len(candidates) == 1:
                external_ids[namespace] = next(iter(candidates))
        override = MANUAL_AUTHOR_OVERRIDES.get(local_id)
        if override:
            external_ids["openalex"] = override["openalex"]
            external_ids["semantic_scholar"] = override["semantic_scholar"]
        selected = {
            namespace: str(external_ids[namespace])
            for namespace in WIKIDATA_PROPERTY_BY_EXTERNAL_ID
            if external_ids.get(namespace)
        }
        lookups_by_author[local_id] = selected
        for namespace, value in selected.items():
            values_by_namespace[namespace].add(value)

    rows_by_namespace = {
        namespace: wikidata_rows(
            WIKIDATA_PROPERTY_BY_EXTERNAL_ID[namespace], sorted(values)
        )
        for namespace, values in values_by_namespace.items()
    }
    profiles: dict[str, dict[str, Any]] = {}
    for local_id, lookups in lookups_by_author.items():
        rows = [
            row
            for namespace, value in lookups.items()
            for row in rows_by_namespace[namespace].get(value, [])
        ]
        people = {row["person"] for row in rows}
        if len(people) != 1:
            continue
        person = next(iter(people))
        websites = sorted(
            {
                row["website"]
                for row in rows
                if row.get("website", "").startswith(("http://", "https://"))
            }
        )
        scholars = sorted({row["scholar"] for row in rows if row.get("scholar")})
        profiles[local_id] = {
            "source_url": person.replace("http://", "https://"),
            "websites": websites,
            "scholars": scholars,
        }
    return profiles


def author_orcid_person(orcid: str) -> dict[str, Any] | None:
    return fetch_json("orcid-person", f"https://pub.orcid.org/v3.0/{orcid}/person")


def author_orcid_employments(orcid: str) -> dict[str, Any] | None:
    return fetch_json(
        "orcid-employments", f"https://pub.orcid.org/v3.0/{orcid}/employments"
    )


def orcid_urls(person: dict[str, Any]) -> list[str]:
    rows = person.get("researcher-urls", {}).get("researcher-url", []) or []
    urls: list[str] = []
    for row in rows:
        value = row.get("url", {}).get("value")
        if value and value.startswith(("http://", "https://")):
            urls.append(value)
    return urls


def homepage_candidate(urls: list[str]) -> str | None:
    excluded = {
        "scholar.google.com",
        "github.com",
        "linkedin.com",
        "www.linkedin.com",
        "twitter.com",
        "x.com",
        "orcid.org",
    }
    for url in urls:
        if urllib.parse.urlparse(url).netloc.lower() not in excluded:
            return url
    return None


def scholar_from_homepage(homepage_url: str) -> str | None:
    page = fetch_text("author-homepages", homepage_url)
    if not page:
        return None
    page = html.unescape(page.replace("\\u0026", "&"))
    matches = re.findall(
        r"https?://scholar\.google\.[^\"'<>\s]+/citations\?[^\"'<>\s]+",
        page,
        flags=re.IGNORECASE,
    )
    for match in matches:
        normalized = scholar_url(match)
        if normalized:
            return normalized
    return None


def current_orcid_affiliations(
    employments: dict[str, Any], orcid: str, retrieved_on: str
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for group in employments.get("affiliation-group", []) or []:
        for wrapper in group.get("summaries", []) or []:
            summary = wrapper.get("employment-summary", {})
            if summary.get("end-date") is not None:
                continue
            organization = summary.get("organization") or {}
            name = organization.get("name")
            if not name:
                continue
            disambiguated = organization.get("disambiguated-organization") or {}
            organization_id = disambiguated.get("disambiguated-organization-identifier")
            ror_id = None
            if organization_id and "ror.org/" in organization_id:
                ror_id = organization_id.rsplit("/", 1)[-1]
            start_year = (summary.get("start-date") or {}).get("year", {}).get("value")
            results.append(
                {
                    "name": name,
                    "ror_id": ror_id,
                    "country_code": (organization.get("address") or {}).get("country"),
                    "evidence_year": int(start_year) if start_year else None,
                    "source_url": f"https://orcid.org/{orcid}",
                    "retrieved_on": retrieved_on,
                }
            )
    unique: dict[tuple[str, str | None], dict[str, Any]] = {}
    for row in results:
        unique[(row["name"], row["ror_id"])] = row
    return list(unique.values())


def google_scholar_affiliation(
    profile_url: str, retrieved_on: str
) -> dict[str, Any] | None:
    page = fetch_text("google-scholar-profiles", profile_url)
    if not page:
        return None
    match = re.search(r'<div class="gsc_prf_il">(.*?)</div>', page, flags=re.DOTALL)
    if not match:
        return None
    value = re.sub(r"<[^>]+>", "", match.group(1))
    value = " ".join(html.unescape(value).split())
    if not value:
        return None
    return {
        "name": value,
        "ror_id": None,
        "country_code": None,
        "evidence_year": None,
        "source_url": profile_url,
        "retrieved_on": retrieved_on,
    }


def make_profile(url: str, source_url: str, retrieved_on: str) -> dict[str, str]:
    return {"url": url, "source_url": source_url, "retrieved_on": retrieved_on}


def enrich_author(
    local_id: str,
    current: dict[str, Any],
    matches: dict[str, Any],
    retrieved_on: str,
    s2_records: dict[str, dict[str, Any]],
    wikidata_profiles: dict[str, dict[str, Any]],
) -> tuple[dict[str, Any], dict[str, Any]]:
    oa_candidates = matches["openalex"].get(local_id, {})
    s2_candidates = matches["semantic_scholar"].get(local_id, {})
    oa_id = next(iter(oa_candidates)) if len(oa_candidates) == 1 else None
    s2_id = next(iter(s2_candidates)) if len(s2_candidates) == 1 else None
    manual_override = MANUAL_AUTHOR_OVERRIDES.get(local_id)
    if manual_override:
        oa_id = manual_override["openalex"]
        s2_id = manual_override["semantic_scholar"]
    evidence = sorted(
        set().union(*(oa_candidates.values() or [set()]), *(s2_candidates.values() or [set()]))
    )

    record = {
        "canonical_name": current["canonical_name"],
        "aliases": list(current.get("aliases", [])),
        "external_ids": {
            "orcid": current.get("external_ids", {}).get("orcid"),
            "openalex": oa_id,
            "semantic_scholar": s2_id,
        },
        "current_affiliations": [],
        "profiles": {"homepage": None, "google_scholar": None},
        "disambiguation_status": "unmatched",
        "disambiguation": {
            "evidence_paper_ids": evidence,
            "matched_on": None,
            "note": None,
        },
    }
    audit: dict[str, Any] = {
        "author_id": local_id,
        "name": current["canonical_name"],
        "openalex_candidates": {key: sorted(value) for key, value in oa_candidates.items()},
        "semantic_scholar_candidates": {key: sorted(value) for key, value in s2_candidates.items()},
    }

    split_sources = []
    if len(oa_candidates) > 1:
        split_sources.append("OpenAlex")
    if len(s2_candidates) > 1:
        split_sources.append("Semantic Scholar")
    if not oa_id and not s2_id:
        if split_sources:
            record["disambiguation_status"] = "needs_review"
            record["disambiguation"]["note"] = (
                "Conflicting publication-linked records in " + " and ".join(split_sources) + "."
            )
        return record, audit

    record["disambiguation_status"] = "matched_by_publication"
    record["disambiguation"]["matched_on"] = retrieved_on
    if split_sources:
        record["disambiguation"]["note"] = (
            "Identity matched through the non-conflicting source; "
            + " and ".join(split_sources)
            + " contains split author records."
        )

    if oa_id:
        oa = author_openalex(oa_id)
        if oa:
            source_url = f"https://openalex.org/{oa_id}"
            external_name = oa.get("display_name")
            if external_name and normalize_text(external_name) != normalize_text(record["canonical_name"]):
                if external_name not in record["aliases"]:
                    record["aliases"].append(external_name)
            orcid = oa.get("orcid")
            if orcid:
                record["external_ids"]["orcid"] = orcid.rsplit("/", 1)[-1]
            audit["openalex_name"] = external_name

    orcid_id = record["external_ids"].get("orcid")
    if orcid_id:
        person = author_orcid_person(orcid_id)
        if person:
            urls = orcid_urls(person)
            gs = next((scholar_url(url) for url in urls if scholar_url(url)), None)
            homepage = homepage_candidate(urls)
            source_url = f"https://orcid.org/{orcid_id}"
            if gs:
                record["profiles"]["google_scholar"] = make_profile(gs, source_url, retrieved_on)
            if homepage:
                record["profiles"]["homepage"] = make_profile(homepage, source_url, retrieved_on)
        employments = author_orcid_employments(orcid_id)
        if employments:
            record["current_affiliations"] = current_orcid_affiliations(
                employments, orcid_id, retrieved_on
            )

    if s2_id:
        s2_record = s2_records.get(s2_id)
        if s2_record:
            source_url = s2_record.get("url") or f"https://www.semanticscholar.org/author/{s2_id}"
            homepage = s2_record.get("homepage")
            gs = scholar_url(homepage)
            if gs:
                record["profiles"]["google_scholar"] = make_profile(gs, source_url, retrieved_on)
            elif homepage and homepage.startswith(("http://", "https://")):
                record["profiles"]["homepage"] = make_profile(homepage, source_url, retrieved_on)
            audit["semantic_scholar_name"] = s2_record.get("name")

    wikidata = wikidata_profiles.get(local_id)
    if wikidata:
        source_url = wikidata["source_url"]
        if not record["profiles"]["homepage"] and wikidata["websites"]:
            record["profiles"]["homepage"] = make_profile(
                wikidata["websites"][0], source_url, retrieved_on
            )
        if not record["profiles"]["google_scholar"] and len(wikidata["scholars"]) == 1:
            profile_url = scholar_url(
                "https://scholar.google.com/citations?user="
                + urllib.parse.quote(wikidata["scholars"][0])
            )
            if profile_url:
                record["profiles"]["google_scholar"] = make_profile(
                    profile_url, source_url, retrieved_on
                )
        audit["wikidata"] = wikidata

    profile_override = MANUAL_PROFILE_OVERRIDES.get(local_id)
    if profile_override:
        source_url = profile_override["source_url"]
        for namespace, external_id in profile_override.get("external_ids", {}).items():
            record["external_ids"][namespace] = external_id
        homepage = profile_override.get("homepage")
        google_scholar = profile_override.get("google_scholar")
        if homepage:
            record["profiles"]["homepage"] = make_profile(
                homepage, source_url, retrieved_on
            )
        if google_scholar:
            record["profiles"]["google_scholar"] = make_profile(
                google_scholar, source_url, retrieved_on
            )
        if profile_override.get("affiliations") and not record["current_affiliations"]:
            record["current_affiliations"] = [
                {
                    "name": name,
                    "ror_id": None,
                    "country_code": None,
                    "evidence_year": int(retrieved_on[:4]),
                    "source_url": source_url,
                    "retrieved_on": retrieved_on,
                }
                for name in profile_override["affiliations"]
            ]
        audit["manual_profile_source"] = source_url

    homepage_profile = record["profiles"]["homepage"]
    if homepage_profile and not record["profiles"]["google_scholar"]:
        gs = scholar_from_homepage(homepage_profile["url"])
        if gs:
            record["profiles"]["google_scholar"] = make_profile(
                gs, homepage_profile["url"], retrieved_on
            )

    scholar_profile = record["profiles"]["google_scholar"]
    if scholar_profile and not record["current_affiliations"]:
        affiliation = google_scholar_affiliation(scholar_profile["url"], retrieved_on)
        if affiliation:
            record["current_affiliations"] = [affiliation]

    record["aliases"] = sorted(set(record["aliases"]), key=str.casefold)
    override = manual_override
    if override:
        record["current_affiliations"] = [
            {
                "name": override["affiliation"],
                "ror_id": None,
                "country_code": None,
                "evidence_year": int(retrieved_on[:4]),
                "source_url": override["affiliation_source"],
                "retrieved_on": retrieved_on,
            }
        ]
        record["profiles"]["homepage"] = make_profile(
            override["homepage"], override["affiliation_source"], retrieved_on
        )
        record["profiles"]["google_scholar"] = make_profile(
            override["google_scholar"], override["homepage"], retrieved_on
        )
        record["disambiguation_status"] = "reviewed"
        record["disambiguation"]["matched_on"] = retrieved_on
        record["disambiguation"]["note"] = override["note"]
    return record, audit


def write_yaml(path: Path, payload: dict[str, Any]) -> None:
    text = yaml.safe_dump(
        payload,
        allow_unicode=True,
        sort_keys=False,
        width=1000,
        default_flow_style=False,
    )
    path.write_text("---\n" + text, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write enriched records to data/authors.yaml")
    parser.add_argument(
        "--include-semantic-scholar",
        action="store_true",
        help="also query Semantic Scholar; unauthenticated access may be heavily rate-limited",
    )
    parser.add_argument(
        "--include-wikidata",
        action="store_true",
        help="look up homepages and Google Scholar IDs through stable IDs in Wikidata",
    )
    args = parser.parse_args()

    papers = load_papers()
    author_data = yaml.safe_load(AUTHORS_PATH.read_text(encoding="utf-8"))
    authors = merge_confirmed_author_records(author_data["authors"])
    matches, failures = collect_publication_matches(
        papers, include_semantic_scholar=args.include_semantic_scholar
    )
    retrieved_on = date.today().isoformat()
    s2_ids = sorted(
        candidates_key
        for candidates in matches["semantic_scholar"].values()
        if len(candidates) == 1
        for candidates_key in candidates
    )
    s2_records = authors_s2_batch(s2_ids) if args.include_semantic_scholar else {}
    wikidata_profiles = (
        collect_wikidata_profiles(authors, matches) if args.include_wikidata else {}
    )

    enriched: dict[str, Any] = {}
    audit_rows: list[dict[str, Any]] = []
    def resolve_author(item: tuple[str, dict[str, Any]]) -> tuple[str, dict[str, Any], dict[str, Any]]:
        local_id, current = item
        record, audit = enrich_author(
            local_id, current, matches, retrieved_on, s2_records, wikidata_profiles
        )
        return local_id, record, audit

    resolved_authors: dict[str, tuple[dict[str, Any], dict[str, Any]]] = {}
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(resolve_author, item) for item in authors.items()]
        for number, future in enumerate(as_completed(futures), start=1):
            local_id, record, audit = future.result()
            resolved_authors[local_id] = (record, audit)
            if number % 50 == 0:
                print(f"enriched {number}/{len(authors)} authors", flush=True)

    for local_id in authors:
        record, audit = resolved_authors[local_id]
        enriched[local_id] = record
        audit_rows.append(audit)

    duplicate_external: dict[str, dict[str, list[str]]] = {}
    for namespace in ("openalex", "semantic_scholar"):
        reverse: dict[str, list[str]] = defaultdict(list)
        for local_id, record in enriched.items():
            external_id = record["external_ids"].get(namespace)
            if external_id:
                reverse[external_id].append(local_id)
        duplicate_external[namespace] = {
            external_id: local_ids
            for external_id, local_ids in reverse.items()
            if len(local_ids) > 1
        }
        for local_ids in duplicate_external[namespace].values():
            for local_id in local_ids:
                enriched[local_id]["disambiguation_status"] = "needs_review"
                enriched[local_id]["disambiguation"]["note"] = (
                    f"Shares {namespace} identity with another local author record."
                )

    counts = defaultdict(int)
    for record in enriched.values():
        counts[record["disambiguation_status"]] += 1
        if record["current_affiliations"]:
            counts["with_affiliation"] += 1
        if record["profiles"]["homepage"]:
            counts["with_homepage"] += 1
        if record["profiles"]["google_scholar"]:
            counts["with_google_scholar"] += 1

    report = {
        "generated_on": retrieved_on,
        "counts": dict(sorted(counts.items())),
        "paper_lookup_failures": failures,
        "duplicate_external_ids": duplicate_external,
        "authors": audit_rows,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report["counts"], indent=2, ensure_ascii=False))
    print(f"report: {REPORT_PATH}")

    if args.apply:
        write_yaml(AUTHORS_PATH, {"schema_version": 1, "authors": enriched})
        print(f"updated: {AUTHORS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
