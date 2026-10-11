"use strict";

const DATA_URL = ".generated/knowledge-base.json";
const SVG_NS = "http://www.w3.org/2000/svg";
const MATHML_NS = "http://www.w3.org/1998/Math/MathML";
const DEFAULT_TREE_ZOOM = 0.85;
const AUTHOR_GRAPH_WIDTH = 2200;
const AUTHOR_GRAPH_HEIGHT = 1600;
const RQ_GRAPH_WIDTH = 2600;
const RQ_NODE_WIDTH = 66;
const RQ_NODE_HEIGHT = 34;
const RQ_FAMILY_COLORS = {
  "evidential-standards": "#346fc4",
  "representation-form": "#e8b72f",
  "computational-mechanism": "#df6ba8",
  "mechanism-explanation": "#8b72c6",
  "temporal-development": "#39aaa8",
  "intervention-control": "#57ba73",
  "generality-transfer": "#ee7b34",
};

const TAB_CONFIG = {
  "research-questions": { title: "Research Questions", kind: "research-questions" },
  techniques: { title: "Techniques", kind: "taxonomy", taxonomyId: "techniques" },
  "target-objects": { title: "Target Objects", kind: "taxonomy", taxonomyId: "research-object" },
  applications: { title: "Applications", kind: "taxonomy", taxonomyId: "application-scenarios" },
  authors: { title: "Authors", kind: "authors" },
};

const state = {
  language: "en",
  view: "graph",
  activeTab: "techniques",
  rightPanel: "overview",
  currentPaperId: null,
  returnPaperId: null,
  paperSource: null,
  paperScroll: 0,
  paperSort: "year-desc",
  modelFamily: "all",
  includeSecondaryFamily: false,
  authorRoles: new Set(["first", "middle", "last"]),
  tabs: Object.fromEntries(
    Object.keys(TAB_CONFIG).map((tabId) => [
      tabId,
      {
        selectedNodeId: null,
        selectedItemType: null,
        collapsed: new Set(),
        zoom: DEFAULT_TREE_ZOOM,
        scrollLeft: 0,
        scrollTop: 0,
        hasPositioned: false,
        pendingFocusNodeId: null,
      },
    ]),
  ),
};

const elements = {
  graphView: document.querySelector("#graph-view"),
  paperView: document.querySelector("#paper-view"),
  contactView: document.querySelector("#contact-view"),
  loading: document.querySelector("#loading-state"),
  error: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
  paperSearchOpen: document.querySelector("#paper-search-open"),
  contactOpen: document.querySelector("#contact-open"),
  paperSearchBackdrop: document.querySelector("#paper-search-backdrop"),
  paperSearchClose: document.querySelector("#paper-search-close"),
  paperSearchKicker: document.querySelector("#paper-search-kicker"),
  paperSearchTitle: document.querySelector("#paper-search-title"),
  paperSearchInput: document.querySelector("#paper-search-input"),
  paperSearchStatus: document.querySelector("#paper-search-status"),
  paperSearchResults: document.querySelector("#paper-search-results"),
  navTabs: [...document.querySelectorAll(".nav-tab")],
  languageOptions: [...document.querySelectorAll(".language-option")],
  returnContext: document.querySelector("#return-context"),
  viewKicker: document.querySelector("#view-kicker"),
  viewTitle: document.querySelector("#view-title"),
  treeTools: document.querySelector("#tree-tools"),
  modelFamilyControl: document.querySelector("#model-family-control"),
  modelFamily: document.querySelector("#model-family"),
  includeSecondaryFamily: document.querySelector("#include-secondary-family"),
  authorRoleControl: document.querySelector("#author-role-control"),
  authorVisibleCount: document.querySelector("#author-visible-count"),
  authorRoleInputs: [...document.querySelectorAll("[data-author-role]")],
  zoomOut: document.querySelector("#zoom-out"),
  zoomReset: document.querySelector("#zoom-reset"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomValue: document.querySelector("#zoom-value"),
  canvasScroll: document.querySelector("#canvas-scroll"),
  canvasStage: document.querySelector("#canvas-stage"),
  treeSvg: document.querySelector("#tree-svg"),
  emptyView: document.querySelector("#empty-view"),
  splitter: document.querySelector("#splitter"),
  detailPane: document.querySelector("#detail-pane"),
  panelTabs: [...document.querySelectorAll(".panel-tab")],
  detailContent: document.querySelector("#detail-content"),
};

let database = null;
let indexes = null;
let paperSearchReturnFocus = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localized(entry, language = state.language) {
  if (!entry) return "";
  return entry[language] || entry.en || entry.zh || "";
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function paperSearchText(paper) {
  return normalizeSearchText(
    [
      paper.title,
      paper.year,
      paper.earliest_public_date,
      paper.venue,
      paper.publication_type,
      ...(paper.authors || []).flatMap((author) => [author.name, author.author_id]),
      ...Object.values(paper.identifiers || {}),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function searchPapers(query) {
  const normalizedQuery = normalizeSearchText(query).trim();
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  return Object.values(database.papers)
    .map((paper) => {
      const haystack = paperSearchText(paper);
      if (!terms.every((term) => haystack.includes(term))) return null;
      const title = normalizeSearchText(paper.title);
      const authors = normalizeSearchText((paper.authors || []).map((author) => author.name).join(" "));
      let score = 0;
      if (title === normalizedQuery) score += 120;
      else if (title.startsWith(normalizedQuery)) score += 90;
      else if (title.includes(normalizedQuery)) score += 65;
      if (authors.includes(normalizedQuery)) score += 45;
      if (normalizeSearchText(paper.year) === normalizedQuery) score += 30;
      if (normalizeSearchText(paper.venue).includes(normalizedQuery)) score += 18;
      score += terms.filter((term) => title.includes(term)).length * 8;
      return { paper, score };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number.parseInt(b.paper.year || 0, 10) - Number.parseInt(a.paper.year || 0, 10) ||
        a.paper.title.localeCompare(b.paper.title, "en"),
    );
}

function updatePaperSearchCopy() {
  const isChinese = state.language === "zh";
  elements.paperSearchOpen.querySelector("span:nth-child(2)").textContent = isChinese ? "检索论文" : "Search papers";
  elements.paperSearchKicker.textContent = isChinese ? "CORPUS 检索" : "CORPUS SEARCH";
  elements.paperSearchTitle.textContent = isChinese ? "查找论文" : "Find a paper";
  elements.paperSearchInput.placeholder = isChinese
    ? "标题、作者、年份、venue、DOI、arXiv…"
    : "Title, author, year, venue, DOI, arXiv…";
  elements.paperSearchClose.setAttribute("aria-label", isChinese ? "关闭论文检索" : "Close paper search");
}

function renderPaperSearchResults() {
  const query = elements.paperSearchInput.value.trim();
  const isChinese = state.language === "zh";
  if (!query) {
    elements.paperSearchStatus.textContent = isChinese
      ? `可检索当前 corpus 中的 ${Object.keys(database.papers).length} 篇论文`
      : `Search ${Object.keys(database.papers).length} papers in the current corpus`;
    elements.paperSearchResults.innerHTML = `
      <div class="paper-search-hint">
        <strong>${isChinese ? "可检索字段" : "Searchable fields"}</strong>
        <span>${isChinese ? "论文标题、作者、年份、venue、DOI、arXiv ID 和 OpenReview ID" : "Title, authors, year, venue, DOI, arXiv ID, and OpenReview ID"}</span>
      </div>
    `;
    return;
  }

  const results = searchPapers(query);
  const visibleResults = results.slice(0, 30);
  elements.paperSearchStatus.textContent = isChinese
    ? `找到 ${results.length} 篇论文${results.length > 30 ? "（仅显示前 30 篇）" : ""}`
    : `${results.length} ${results.length === 1 ? "paper" : "papers"} found${results.length > 30 ? " · showing the first 30" : ""}`;
  if (!results.length) {
    elements.paperSearchResults.innerHTML = `<div class="paper-search-empty">${isChinese ? "没有匹配的论文。可以尝试作者姓氏、年份或更短的关键词。" : "No matching papers. Try an author surname, a year, or a shorter keyword."}</div>`;
    return;
  }
  elements.paperSearchResults.innerHTML = visibleResults
    .map(({ paper }) => {
      const authors = (paper.authors || []).map((author) => author.name);
      const authorLine = authors.length > 4 ? `${authors.slice(0, 4).join(" · ")} · …` : authors.join(" · ");
      const meta = [paper.year, paper.venue || paper.publication_type].filter(Boolean);
      return `
        <button type="button" class="paper-search-result" data-search-paper-id="${escapeHtml(paper.paper_id)}">
          <span class="paper-search-result-title">${escapeHtml(paper.title)}</span>
          ${authorLine ? `<span class="paper-search-result-authors">${escapeHtml(authorLine)}</span>` : ""}
          ${meta.length ? `<span class="paper-search-result-meta">${meta.map(escapeHtml).join(" · ")}</span>` : ""}
        </button>
      `;
    })
    .join("");
  elements.paperSearchResults.querySelectorAll("[data-search-paper-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const paperId = button.dataset.searchPaperId;
      closePaperSearch({ restoreFocus: false });
      openPaper(paperId);
    });
  });
}

function openPaperSearch() {
  if (!database) return;
  paperSearchReturnFocus = document.activeElement;
  updatePaperSearchCopy();
  elements.paperSearchBackdrop.hidden = false;
  document.body.classList.add("search-is-open");
  renderPaperSearchResults();
  requestAnimationFrame(() => {
    elements.paperSearchInput.focus();
    elements.paperSearchInput.select();
  });
}

function closePaperSearch({ restoreFocus = true } = {}) {
  if (elements.paperSearchBackdrop.hidden) return;
  elements.paperSearchBackdrop.hidden = true;
  document.body.classList.remove("search-is-open");
  if (restoreFocus && paperSearchReturnFocus instanceof HTMLElement) paperSearchReturnFocus.focus();
}

function displayNodeTitle(taxonomyId, node) {
  if (taxonomyId === "techniques" && !node?.parent_id) return "Techniques";
  if (taxonomyId === "application-scenarios" && !node?.parent_id) return "Applications";
  return node?.title || "";
}

function renderProse(text) {
  if (!text) return '<p class="unclassified">No overview available.</p>';
  return String(text)
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const safeInlineMarkup = escapeHtml(paragraph)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
      return `<p>${safeInlineMarkup.replaceAll("\n", "<br>")}</p>`;
    })
    .join("");
}

function normalizeImplicitSummaryMath(text) {
  const source = String(text || "");
  let output = "";
  let copiedUntil = 0;
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("\\(", index)) {
      const explicitEnd = source.indexOf("\\)", index + 2);
      if (explicitEnd < 0) break;
      index = explicitEnd + 2;
      continue;
    }
    if (source[index] !== "(" || source[index - 1] === "\\") {
      index += 1;
      continue;
    }

    let depth = 1;
    let end = index + 1;
    while (end < source.length && depth > 0) {
      if (source[end] === "(" && source[end - 1] !== "\\") depth += 1;
      if (source[end] === ")" && source[end - 1] !== "\\") depth -= 1;
      end += 1;
    }
    if (depth !== 0) break;

    const group = source.slice(index, end);
    const content = group.slice(1, -1).trim();
    const looksLikeMath =
      /\\[A-Za-z]+/.test(content) ||
      /[_^]/.test(content) ||
      /[A-Za-z0-9]\s*(?:=|>|<)\s*/.test(content) ||
      /^[a-z]$/.test(content);

    if (looksLikeMath) {
      output += source.slice(copiedUntil, index);
      output += `\\(${group}\\)`;
      copiedUntil = end;
    }
    index = end;
  }

  return output + source.slice(copiedUntil);
}

function createMathElement(tagName, text = null) {
  const element = document.createElementNS(MATHML_NS, tagName);
  if (text !== null) element.textContent = text;
  return element;
}

function latexToMathML(latex, display = false) {
  const source = String(latex).trim();
  let index = 0;
  const greek = {
    alpha: "α",
    beta: "β",
    gamma: "γ",
    delta: "δ",
    Delta: "Δ",
    Gamma: "Γ",
    epsilon: "ε",
    varepsilon: "ε",
    theta: "θ",
    kappa: "κ",
    lambda: "λ",
    ell: "ℓ",
    mu: "μ",
    nu: "ν",
    pi: "π",
    rho: "ρ",
    sigma: "σ",
    phi: "φ",
    psi: "ψ",
    omega: "ω",
  };
  const operators = {
    cdot: "·",
    times: "×",
    pm: "±",
    mp: "∓",
    le: "≤",
    leq: "≤",
    ge: "≥",
    geq: "≥",
    neq: "≠",
    approx: "≈",
    sim: "∼",
    to: "→",
    rightarrow: "→",
    leftarrow: "←",
    uparrow: "↑",
    downarrow: "↓",
    mapsto: "↦",
    in: "∈",
    notin: "∉",
    infty: "∞",
    ldots: "…",
    mid: "|",
    nabla: "∇",
    top: "⊤",
    propto: "∝",
    "%": "%",
  };

  const skipWhitespace = () => {
    while (index < source.length && /\s/.test(source[index])) index += 1;
  };

  const readRawGroup = () => {
    skipWhitespace();
    if (source[index] !== "{") return "";
    index += 1;
    const start = index;
    let depth = 1;
    while (index < source.length && depth > 0) {
      if (source[index] === "{") depth += 1;
      else if (source[index] === "}") depth -= 1;
      index += 1;
    }
    return source.slice(start, Math.max(start, index - 1));
  };

  let parseRow;
  const parseRequiredGroup = () => {
    skipWhitespace();
    if (source[index] === "{") {
      index += 1;
      return parseRow("}");
    }
    return parseAtom();
  };

  const parseCommand = () => {
    index += 1;
    const start = index;
    while (index < source.length && /[A-Za-z]/.test(source[index])) index += 1;
    const command = source.slice(start, index) || source[index++];
    if (["left", "right"].includes(command)) return parseAtom();
    if (command === "frac") {
      const fraction = createMathElement("mfrac");
      fraction.append(parseRequiredGroup(), parseRequiredGroup());
      return fraction;
    }
    if (command === "sqrt") {
      const squareRoot = createMathElement("msqrt");
      squareRoot.append(parseRequiredGroup());
      return squareRoot;
    }
    if (command === "hat") {
      const accented = createMathElement("mover");
      accented.setAttribute("accent", "true");
      accented.append(parseRequiredGroup(), createMathElement("mo", "^"));
      return accented;
    }
    if (command === "smash") return parseRequiredGroup();
    if (["text", "textrm", "operatorname"].includes(command)) {
      return createMathElement("mtext", readRawGroup());
    }
    if (["mathrm", "mathbf", "mathit", "textit", "mathbb"].includes(command)) {
      const styled = createMathElement("mstyle");
      styled.setAttribute(
        "mathvariant",
        command === "mathbf"
          ? "bold"
          : ["mathit", "textit"].includes(command)
            ? "italic"
            : command === "mathbb"
              ? "double-struck"
              : "normal",
      );
      styled.append(parseRequiredGroup());
      return styled;
    }
    if (["sin", "cos", "tan", "log", "ln", "exp", "max", "min", "argmax", "argmin"].includes(command)) {
      const fn = createMathElement("mi", command);
      fn.setAttribute("mathvariant", "normal");
      return fn;
    }
    if (greek[command]) return createMathElement("mi", greek[command]);
    if (operators[command]) return createMathElement("mo", operators[command]);
    if (["sum", "prod", "int"].includes(command)) {
      const symbol = createMathElement("mo", { sum: "∑", prod: "∏", int: "∫" }[command]);
      symbol.setAttribute("largeop", "true");
      return symbol;
    }
    if (["bmod", "pmod"].includes(command)) return createMathElement("mo", "mod");
    if ([",", ";", ":", "!", "quad", "qquad"].includes(command)) {
      const space = createMathElement("mspace");
      space.setAttribute("width", command === "qquad" ? "2em" : command === "quad" ? "1em" : "0.2em");
      return space;
    }
    return createMathElement("mtext", `\\${command}`);
  };

  const parseAtom = () => {
    skipWhitespace();
    if (index >= source.length) return createMathElement("mrow");
    const character = source[index];
    if (character === "{") {
      index += 1;
      return parseRow("}");
    }
    if (character === "\\") return parseCommand();
    if (/\d/.test(character)) {
      const start = index;
      while (index < source.length && /[\d.]/.test(source[index])) index += 1;
      return createMathElement("mn", source.slice(start, index));
    }
    index += 1;
    if (/[A-Za-z]/.test(character)) return createMathElement("mi", character);
    return createMathElement("mo", character);
  };

  parseRow = (closingCharacter = null) => {
    const row = createMathElement("mrow");
    while (index < source.length) {
      skipWhitespace();
      if (closingCharacter && source[index] === closingCharacter) {
        index += 1;
        break;
      }
      if (index >= source.length) break;
      let base = parseAtom();
      let subscript = null;
      let superscript = null;
      skipWhitespace();
      while (source[index] === "_" || source[index] === "^") {
        const marker = source[index];
        index += 1;
        const script = parseRequiredGroup();
        if (marker === "_") subscript = script;
        else superscript = script;
        skipWhitespace();
      }
      if (subscript && superscript) {
        const scripted = createMathElement("msubsup");
        scripted.append(base, subscript, superscript);
        base = scripted;
      } else if (subscript) {
        const scripted = createMathElement("msub");
        scripted.append(base, subscript);
        base = scripted;
      } else if (superscript) {
        const scripted = createMathElement("msup");
        scripted.append(base, superscript);
        base = scripted;
      }
      row.append(base);
    }
    return row;
  };

  const math = createMathElement("math");
  math.classList.add(display ? "math-display" : "math-inline");
  math.setAttribute("display", display ? "block" : "inline");
  math.setAttribute("aria-label", source);
  math.append(parseRow());
  return math;
}

function renderMath(root) {
  if (!root) return;
  const findInlineDollarClose = (value, start) => {
    const close = value.indexOf("$", start);
    return close > start && !/\s/.test(value[close - 1]) ? close : -1;
  };
  const delimiters = [
    { open: "$$", close: "$$", display: true },
    { open: "\\[", close: "\\]", display: true },
    { open: "\\(", close: "\\)", display: false },
    { open: "$", close: "$", display: false, findClose: findInlineDollarClose },
  ];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const parentTag = walker.currentNode.parentElement?.tagName?.toLowerCase();
    if (!["script", "style", "textarea", "pre", "code", "math"].includes(parentTag)) {
      textNodes.push(walker.currentNode);
    }
  }

  for (const textNode of textNodes) {
    const value = textNode.nodeValue || "";
    let cursor = 0;
    let changed = false;
    const fragment = document.createDocumentFragment();
    while (cursor < value.length) {
      const candidates = delimiters
        .map((delimiter) => ({ ...delimiter, start: value.indexOf(delimiter.open, cursor) }))
        .filter((candidate) => candidate.start >= 0)
        .sort((a, b) => a.start - b.start);
      if (!candidates.length) break;
      const delimiter = candidates[0];
      const formulaStart = delimiter.start + delimiter.open.length;
      const formulaEnd = delimiter.findClose
        ? delimiter.findClose(value, formulaStart)
        : value.indexOf(delimiter.close, formulaStart);
      if (formulaEnd < 0) {
        fragment.append(document.createTextNode(value.slice(cursor, formulaStart)));
        cursor = formulaStart;
        continue;
      }
      if (delimiter.start > cursor) fragment.append(document.createTextNode(value.slice(cursor, delimiter.start)));
      fragment.append(latexToMathML(value.slice(formulaStart, formulaEnd), delimiter.display));
      cursor = formulaEnd + delimiter.close.length;
      changed = true;
    }
    if (!changed) continue;
    if (cursor < value.length) fragment.append(document.createTextNode(value.slice(cursor)));
    textNode.replaceWith(fragment);
  }
}

function authorNodeRadius(author) {
  return 5.5 + Math.sqrt(author.paper_count) * 2.7;
}

function buildAuthorLayout(network) {
  const centerX = AUTHOR_GRAPH_WIDTH / 2;
  const centerY = AUTHOR_GRAPH_HEIGHT / 2;
  const padding = 90;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const ordered = [...network.nodes].sort(
    (a, b) =>
      b.paper_count - a.paper_count ||
      b.weighted_degree - a.weighted_degree ||
      a.canonical_name.localeCompare(b.canonical_name, "en"),
  );
  const points = ordered.map((author, index) => {
    const angle = index * goldenAngle;
    const radius = 22 + Math.sqrt(index) * 34;
    return {
      author_id: author.author_id,
      radius: authorNodeRadius(author),
      x: centerX + Math.cos(angle) * radius * 1.22,
      y: centerY + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    };
  });
  const pointMap = new Map(points.map((point) => [point.author_id, point]));
  const links = network.edges
    .map((edge) => ({ edge, source: pointMap.get(edge.source), target: pointMap.get(edge.target) }))
    .filter((link) => link.source && link.target);

  for (let iteration = 0; iteration < 170; iteration += 1) {
    const forces = new Map(points.map((point) => [point.author_id, { x: 0, y: 0 }]));

    for (const { edge, source, target } of links) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const desired = Math.max(42, 82 - Math.log2(edge.paper_count + 1) * 13);
      const pull = (distance - desired) * 0.0028 * (1 + Math.log1p(edge.paper_count));
      const fx = (dx / distance) * pull;
      const fy = (dy / distance) * pull;
      forces.get(source.author_id).x += fx;
      forces.get(source.author_id).y += fy;
      forces.get(target.author_id).x -= fx;
      forces.get(target.author_id).y -= fy;
    }

    const cellSize = 125;
    const grid = new Map();
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const cellX = Math.floor(point.x / cellSize);
      const cellY = Math.floor(point.y / cellSize);
      const key = `${cellX},${cellY}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(index);
    }

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const cellX = Math.floor(point.x / cellSize);
      const cellY = Math.floor(point.y / cellSize);
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (const otherIndex of grid.get(`${cellX + offsetX},${cellY + offsetY}`) || []) {
            if (otherIndex <= index) continue;
            const other = points[otherIndex];
            let dx = other.x - point.x;
            let dy = other.y - point.y;
            let distance = Math.hypot(dx, dy);
            if (distance < 0.01) {
              dx = 0.01;
              dy = 0;
              distance = 0.01;
            }
            const minimum = point.radius + other.radius + 15;
            const range = Math.max(minimum, 115);
            if (distance >= range) continue;
            const push = ((range - distance) / range) * 0.75 + 18 / (distance * distance);
            const fx = (dx / distance) * push;
            const fy = (dy / distance) * push;
            forces.get(point.author_id).x -= fx;
            forces.get(point.author_id).y -= fy;
            forces.get(other.author_id).x += fx;
            forces.get(other.author_id).y += fy;
          }
        }
      }
    }

    const cooling = 1 - iteration / 170;
    const maxStep = 1.8 + cooling * 7;
    for (const point of points) {
      const force = forces.get(point.author_id);
      force.x += (centerX - point.x) * 0.00065;
      force.y += (centerY - point.y) * 0.00065;
      point.vx = (point.vx + force.x) * 0.74;
      point.vy = (point.vy + force.y) * 0.74;
      const speed = Math.max(0.001, Math.hypot(point.vx, point.vy));
      if (speed > maxStep) {
        point.vx = (point.vx / speed) * maxStep;
        point.vy = (point.vy / speed) * maxStep;
      }
      point.x = Math.min(AUTHOR_GRAPH_WIDTH - padding, Math.max(padding, point.x + point.vx));
      point.y = Math.min(AUTHOR_GRAPH_HEIGHT - padding, Math.max(padding, point.y + point.vy));
    }
  }

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const scale = Math.min(
    (AUTHOR_GRAPH_WIDTH - padding * 2) / Math.max(1, maxX - minX),
    (AUTHOR_GRAPH_HEIGHT - padding * 2) / Math.max(1, maxY - minY),
  );
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  for (const point of points) {
    point.x = centerX + (point.x - midX) * scale;
    point.y = centerY + (point.y - midY) * scale;
  }
  return new Map(points.map((point) => [point.author_id, point]));
}

function makeIndexes(payload) {
  const taxonomyIndexes = {};
  for (const [taxonomyId, taxonomy] of Object.entries(payload.taxonomies)) {
    const nodeMap = new Map(taxonomy.nodes.map((node) => [node.node_id, node]));
    const children = new Map();
    const roots = [];
    for (const node of taxonomy.nodes) {
      if (node.parent_id && nodeMap.has(node.parent_id)) {
        if (!children.has(node.parent_id)) children.set(node.parent_id, []);
        children.get(node.parent_id).push(node.node_id);
      } else {
        roots.push(node.node_id);
      }
    }
    taxonomyIndexes[taxonomyId] = { taxonomy, nodeMap, children, roots };
  }

  const relationsByTaxonomy = new Map();
  const relationsByPaper = new Map();
  for (const relation of payload.relations) {
    if (!relationsByTaxonomy.has(relation.taxonomy_id)) {
      relationsByTaxonomy.set(relation.taxonomy_id, []);
    }
    relationsByTaxonomy.get(relation.taxonomy_id).push(relation);
    if (!relationsByPaper.has(relation.paper_id)) relationsByPaper.set(relation.paper_id, []);
    relationsByPaper.get(relation.paper_id).push(relation);
  }

  const familyPapers = new Map();
  for (const assignment of payload.model_families.paper_assignments) {
    familyPapers.set(assignment.model_family_id, {
      primary: new Set(assignment.primary_paper_ids),
      secondary: new Set(assignment.secondary_paper_ids),
    });
  }

  const authorNodeMap = new Map(payload.author_network.nodes.map((node) => [node.author_id, node]));
  const authorEdgesByNode = new Map(payload.author_network.nodes.map((node) => [node.author_id, []]));
  for (const edge of payload.author_network.edges) {
    authorEdgesByNode.get(edge.source)?.push(edge);
    authorEdgesByNode.get(edge.target)?.push(edge);
  }
  const authorLayout = buildAuthorLayout(payload.author_network);

  const rqFamilyMap = new Map(
    payload.research_question_graph.families.map((family) => [family.family_id, family]),
  );
  const rqNodeMap = new Map(payload.research_question_graph.nodes.map((node) => [node.rq_id, node]));
  const rqNodesByFamily = new Map([...rqFamilyMap.keys()].map((familyId) => [familyId, []]));
  const rqEdgesByNode = new Map([...rqNodeMap.keys()].map((nodeId) => [nodeId, []]));
  const rqAssignmentsByPaper = new Map();
  for (const node of payload.research_question_graph.nodes) {
    rqNodesByFamily.get(node.family_id)?.push(node);
    for (const [role, paperIds] of [
      ["primary", node.primary_paper_ids || []],
      ["secondary", node.secondary_paper_ids || []],
    ]) {
      for (const paperId of paperIds) {
        if (!rqAssignmentsByPaper.has(paperId)) rqAssignmentsByPaper.set(paperId, []);
        rqAssignmentsByPaper.get(paperId).push({ rq_id: node.rq_id, role });
      }
    }
  }
  for (const edge of payload.research_question_graph.edges) {
    rqEdgesByNode.get(edge.source)?.push(edge);
    rqEdgesByNode.get(edge.target)?.push(edge);
  }

  return {
    taxonomyIndexes,
    relationsByTaxonomy,
    relationsByPaper,
    familyPapers,
    authorNodeMap,
    authorEdgesByNode,
    authorLayout,
    rqFamilyMap,
    rqNodeMap,
    rqNodesByFamily,
    rqEdgesByNode,
    rqAssignmentsByPaper,
  };
}

function taxonomyConfigForTab(tabId = state.activeTab) {
  const config = TAB_CONFIG[tabId];
  if (!config || config.kind !== "taxonomy") return null;
  return {
    ...config,
    index: indexes.taxonomyIndexes[config.taxonomyId],
  };
}

function initializeSelections() {
  for (const [tabId, config] of Object.entries(TAB_CONFIG)) {
    if (config.kind !== "taxonomy") continue;
    const taxonomyIndex = indexes.taxonomyIndexes[config.taxonomyId];
    const rootId = taxonomyIndex.roots[0];
    const rootIds = new Set(taxonomyIndex.roots);
    state.tabs[tabId].selectedNodeId = rootId;
    state.tabs[tabId].collapsed = new Set(
      [...taxonomyIndex.children.keys()].filter((nodeId) => !rootIds.has(nodeId)),
    );
  }
  const leadAuthor = [...database.author_network.nodes].sort(
    (a, b) => b.paper_count - a.paper_count || b.weighted_degree - a.weighted_degree,
  )[0];
  state.tabs.authors.selectedNodeId = leadAuthor?.author_id || null;
  const firstRqFamily = database.research_question_graph.families[0];
  state.tabs["research-questions"].selectedNodeId = firstRqFamily?.family_id || null;
  state.tabs["research-questions"].selectedItemType = firstRqFamily ? "family" : null;
}

function applyInitialLocation() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const paperId = params.get("paper");
  if (paperId && database.papers[paperId]) {
    state.view = "paper";
    state.currentPaperId = paperId;
    return;
  }
  const view = params.get("view");
  if (view === "contact") {
    state.view = "contact";
    return;
  }
  if (!view || !TAB_CONFIG[view]) return;
  state.activeTab = view;
  const nodeId = params.get("node");
  if (!nodeId) return;
  if (view === "research-questions") {
    if (indexes.rqNodeMap.has(nodeId)) {
      state.tabs[view].selectedNodeId = nodeId;
      state.tabs[view].selectedItemType = "node";
      state.tabs[view].pendingFocusNodeId = nodeId;
    } else if (indexes.rqFamilyMap.has(nodeId)) {
      state.tabs[view].selectedNodeId = nodeId;
      state.tabs[view].selectedItemType = "family";
      state.tabs[view].pendingFocusNodeId = nodeId;
    }
  } else if (TAB_CONFIG[view].kind === "taxonomy") {
    const taxonomyIndex = indexes.taxonomyIndexes[TAB_CONFIG[view].taxonomyId];
    if (taxonomyIndex.nodeMap.has(nodeId)) {
      state.tabs[view].selectedNodeId = nodeId;
      state.tabs[view].pendingFocusNodeId = nodeId;
      expandPath(view, nodeId);
    }
  } else if (view === "authors" && indexes.authorNodeMap.has(nodeId)) {
    state.tabs.authors.selectedNodeId = nodeId;
    state.tabs.authors.pendingFocusNodeId = nodeId;
  }
}

function initializeModelFamilies() {
  const options = [
    '<option value="all">All Models</option>',
    ...database.model_families.families.map(
      (family) =>
        `<option value="${escapeHtml(family.model_family_id)}">${escapeHtml(family.selector_label)}</option>`,
    ),
  ];
  elements.modelFamily.innerHTML = options.join("");
}

function historySnapshot() {
  return {
    view: state.view,
    activeTab: state.activeTab,
    rightPanel: state.rightPanel,
    currentPaperId: state.currentPaperId,
    returnPaperId: state.returnPaperId,
    paperSource: state.paperSource,
  };
}

function applyHistorySnapshot(snapshot) {
  if (!snapshot) return;
  state.view = snapshot.view || "graph";
  state.activeTab = snapshot.activeTab || "techniques";
  state.rightPanel = snapshot.rightPanel || "overview";
  state.currentPaperId = snapshot.currentPaperId || null;
  state.returnPaperId = snapshot.returnPaperId || null;
  state.paperSource = snapshot.paperSource || null;
}

function historyUrl() {
  if (state.view === "paper" && state.currentPaperId) return `#paper=${encodeURIComponent(state.currentPaperId)}`;
  if (state.view === "contact") return "#view=contact";
  const selected = state.tabs[state.activeTab]?.selectedNodeId;
  const suffix = selected ? `&node=${encodeURIComponent(selected)}` : "";
  return `#view=${encodeURIComponent(state.activeTab)}${suffix}`;
}

function pushHistory() {
  history.pushState(historySnapshot(), "", historyUrl());
}

function replaceHistory() {
  history.replaceState(historySnapshot(), "", historyUrl());
}

function captureCanvasScroll() {
  const tabState = state.tabs[state.activeTab];
  if (!tabState || state.view !== "graph") return;
  tabState.scrollLeft = elements.canvasScroll.scrollLeft;
  tabState.scrollTop = elements.canvasScroll.scrollTop;
}

function restoreCanvasScroll() {
  const tabState = state.tabs[state.activeTab];
  if (!tabState) return;
  requestAnimationFrame(() => {
    elements.canvasScroll.scrollLeft = tabState.scrollLeft;
    elements.canvasScroll.scrollTop = tabState.scrollTop;
  });
}

function updateNavigation() {
  elements.navTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeTab && state.view === "graph");
  });
  elements.languageOptions.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === state.language);
  });
  elements.contactOpen.classList.toggle("is-active", state.view === "contact");
  elements.contactOpen.setAttribute("aria-current", state.view === "contact" ? "page" : "false");
}

function updatePanelTabs() {
  elements.panelTabs.forEach((button) => {
    const isActive = button.dataset.panel === state.rightPanel;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function updateReturnContext() {
  if (!state.returnPaperId || state.view !== "graph") {
    elements.returnContext.hidden = true;
    elements.returnContext.innerHTML = "";
    return;
  }
  const paper = database.papers[state.returnPaperId];
  if (!paper) return;
  elements.returnContext.hidden = false;
  elements.returnContext.innerHTML = `
    <button type="button" class="return-button" id="return-to-paper">
      <span aria-hidden="true">←</span>
      <span>Back to ${escapeHtml(paper.title)}</span>
    </button>
  `;
  document.querySelector("#return-to-paper").addEventListener("click", () => history.back());
}

function setPanel(panel) {
  state.rightPanel = panel;
  updatePanelTabs();
  renderDetailPanel();
  replaceHistory();
}

function switchTab(tabId, { push = true, keepPaperContext = false } = {}) {
  if (!TAB_CONFIG[tabId]) return;
  if (state.view === "graph") captureCanvasScroll();
  if (state.view === "paper") {
    state.paperScroll = elements.paperView.scrollTop;
    if (keepPaperContext || state.currentPaperId) state.returnPaperId = state.currentPaperId;
  }
  state.view = "graph";
  state.activeTab = tabId;
  state.currentPaperId = null;
  state.rightPanel = "overview";
  if (push) pushHistory();
  render();
}

function openContact({ push = true } = {}) {
  if (state.view === "graph") captureCanvasScroll();
  if (state.view === "paper") state.paperScroll = elements.paperView.scrollTop;
  state.view = "contact";
  state.currentPaperId = null;
  if (push) pushHistory();
  render();
}

function renderContact() {
  const isChinese = state.language === "zh";
  elements.contactView.innerHTML = `
    <article class="contact-article">
      <p class="eyebrow">Contact</p>
      <h1>${isChinese ? "参与完善知识库" : "Help improve the knowledge base"}</h1>
      <p class="contact-intro">
        ${
          isChinese
            ? "如果你有建议收录的论文、发现内容或分类需要纠正，或对网站有其他改进意见，欢迎在 GitHub 提交 Issue。"
            : "If you would like to suggest a paper, report a correction to the content or taxonomy, or propose another improvement, please open an issue on GitHub."
        }
      </p>
      <section class="contact-repository" aria-labelledby="contact-repository-title">
        <div>
          <p class="contact-label">${isChinese ? "项目仓库" : "Repository"}</p>
          <h2 id="contact-repository-title">ZhaoyueSun/llm-interpretability-kb</h2>
          <code>git@github.com:ZhaoyueSun/llm-interpretability-kb.git</code>
        </div>
        <div class="contact-actions">
          <a href="https://github.com/ZhaoyueSun/llm-interpretability-kb" target="_blank" rel="noreferrer">
            ${isChinese ? "查看 GitHub 仓库" : "View repository"} ↗
          </a>
          <a class="is-primary" href="https://github.com/ZhaoyueSun/llm-interpretability-kb/issues" target="_blank" rel="noreferrer">
            ${isChinese ? "提交 Issue" : "Open an issue"} ↗
          </a>
        </div>
      </section>
    </article>
  `;
}

function render() {
  updateNavigation();
  updateReturnContext();
  if (state.view === "contact") {
    elements.graphView.hidden = true;
    elements.paperView.hidden = true;
    elements.contactView.hidden = false;
    elements.returnContext.hidden = true;
    renderContact();
    return;
  }
  elements.contactView.hidden = true;
  if (state.view === "paper") {
    elements.graphView.hidden = true;
    elements.paperView.hidden = false;
    elements.returnContext.hidden = true;
    renderPaper();
  } else {
    elements.paperView.hidden = true;
    elements.graphView.hidden = false;
    renderGraph();
  }
}

function renderGraph() {
  const config = TAB_CONFIG[state.activeTab];
  elements.viewTitle.textContent = config.title;
  elements.viewKicker.textContent =
    config.kind === "taxonomy"
      ? "Taxonomy"
      : config.kind === "authors"
        ? "Coauthorship network"
        : "Research evolution";
  updatePanelTabs();

  const isTaxonomy = config.kind === "taxonomy";
  const isAuthors = config.kind === "authors";
  const isResearchQuestions = config.kind === "research-questions";
  const hasVisualization = isTaxonomy || isAuthors || isResearchQuestions;
  elements.treeTools.hidden = !hasVisualization;
  elements.canvasStage.hidden = !hasVisualization;
  elements.treeSvg.hidden = !hasVisualization;
  elements.emptyView.hidden = hasVisualization;
  elements.modelFamilyControl.hidden = state.activeTab !== "target-objects";
  elements.authorRoleControl.hidden = !isAuthors;
  elements.modelFamily.value = state.modelFamily;
  elements.includeSecondaryFamily.checked = state.includeSecondaryFamily;
  elements.authorRoleInputs.forEach((input) => {
    input.checked = state.authorRoles.has(input.dataset.authorRole);
  });

  if (!hasVisualization) {
    elements.detailContent.innerHTML = "";
    restoreCanvasScroll();
    return;
  }

  elements.zoomValue.textContent = `${Math.round(state.tabs[state.activeTab].zoom * 100)}%`;
  if (isAuthors) renderAuthorGraph();
  else if (isResearchQuestions) renderResearchQuestionGraph();
  else renderTree();
  renderDetailPanel();
  restoreCanvasScroll();
}

function allowedNodeIds(taxonomyIndex) {
  const allIds = new Set(taxonomyIndex.nodeMap.keys());
  if (state.activeTab !== "target-objects" || state.modelFamily === "all") return allIds;

  const allowed = new Set();
  for (const node of taxonomyIndex.nodeMap.values()) {
    const families = node.applicable_model_families;
    if (!families || families.includes(state.modelFamily)) {
      let current = node;
      while (current) {
        allowed.add(current.node_id);
        current = current.parent_id ? taxonomyIndex.nodeMap.get(current.parent_id) : null;
      }
    }
  }
  return allowed;
}

function descendantsOf(taxonomyIndex, nodeId) {
  const result = new Set();
  const stack = [nodeId];
  while (stack.length) {
    const current = stack.pop();
    if (result.has(current)) continue;
    result.add(current);
    for (const childId of taxonomyIndex.children.get(current) || []) stack.push(childId);
  }
  return result;
}

function familyPaperFilter() {
  if (state.activeTab !== "target-objects" || state.modelFamily === "all") return null;
  const assignment = indexes.familyPapers.get(state.modelFamily);
  if (!assignment) return new Set();
  const allowed = new Set(assignment.primary);
  if (state.includeSecondaryFamily) {
    for (const paperId of assignment.secondary) allowed.add(paperId);
  }
  return allowed;
}

function papersForNode(taxonomyId, nodeId) {
  const taxonomyIndex = indexes.taxonomyIndexes[taxonomyId];
  const descendants = descendantsOf(taxonomyIndex, nodeId);
  const paperFilter = familyPaperFilter();
  const grouped = new Map();

  for (const relation of indexes.relationsByTaxonomy.get(taxonomyId) || []) {
    if (!descendants.has(relation.node_id)) continue;
    if (paperFilter && !paperFilter.has(relation.paper_id)) continue;
    if (!grouped.has(relation.paper_id)) grouped.set(relation.paper_id, new Set());
    grouped.get(relation.paper_id).add(relation.relation_role);
  }

  return [...grouped.entries()]
    .map(([paperId, roles]) => ({
      paper: database.papers[paperId],
      roles,
    }))
    .filter((entry) => entry.paper)
    .sort((a, b) => (a.paper.display_order || 9999) - (b.paper.display_order || 9999));
}

function layoutTree(taxonomyIndex, allowedIds) {
  const tabState = state.tabs[state.activeTab];
  const nodeWidth = 300;
  const nodeHeight = 56;
  const depthGap = 56;
  const rowGap = 14;
  const marginX = 34;
  const marginY = 28;
  let nextLeafY = marginY;
  let maxDepth = 0;
  const positions = new Map();
  const visibleEdges = [];

  function visit(nodeId, depth) {
    if (!allowedIds.has(nodeId)) return null;
    maxDepth = Math.max(maxDepth, depth);
    const allChildren = (taxonomyIndex.children.get(nodeId) || []).filter((childId) => allowedIds.has(childId));
    const expandedChildren = tabState.collapsed.has(nodeId) ? [] : allChildren;
    const childPositions = [];

    for (const childId of expandedChildren) {
      const position = visit(childId, depth + 1);
      if (position) {
        childPositions.push(position);
        visibleEdges.push([nodeId, childId]);
      }
    }

    const y = childPositions.length
      ? childPositions.reduce((sum, position) => sum + position.y, 0) / childPositions.length
      : nextLeafY;
    if (!childPositions.length) nextLeafY += nodeHeight + rowGap;
    const position = { x: marginX + depth * (nodeWidth + depthGap), y, depth, allChildren };
    positions.set(nodeId, position);
    return position;
  }

  for (const rootId of taxonomyIndex.roots) {
    const rootPosition = visit(rootId, 0);
    if (rootPosition) nextLeafY += rowGap;
  }

  return {
    positions,
    visibleEdges,
    nodeWidth,
    nodeHeight,
    width: Math.max(760, marginX * 2 + (maxDepth + 1) * nodeWidth + maxDepth * depthGap + 70),
    height: Math.max(560, nextLeafY + marginY),
  };
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tagName);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

function wrapLabel(title, limit = 34) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > limit && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 3) return lines;
  const trimmed = lines.slice(0, 3);
  trimmed[2] = `${trimmed[2].slice(0, Math.max(6, limit - 2))}…`;
  return trimmed;
}

function collapseDescendantBranches(taxonomyIndex, nodeId, collapsed) {
  const stack = [...(taxonomyIndex.children.get(nodeId) || [])];
  while (stack.length) {
    const descendantId = stack.pop();
    const children = taxonomyIndex.children.get(descendantId) || [];
    if (children.length) collapsed.add(descendantId);
    stack.push(...children);
  }
}

function renderTree() {
  const config = taxonomyConfigForTab();
  if (!config?.index) return;
  const taxonomyIndex = config.index;
  const tabState = state.tabs[state.activeTab];
  const allowedIds = allowedNodeIds(taxonomyIndex);

  if (!allowedIds.has(tabState.selectedNodeId)) {
    tabState.selectedNodeId = taxonomyIndex.roots.find((rootId) => allowedIds.has(rootId)) || null;
  }

  const layout = layoutTree(taxonomyIndex, allowedIds);
  const zoom = tabState.zoom;
  elements.treeSvg.innerHTML = "";
  elements.treeSvg.setAttribute("aria-label", "Taxonomy tree");
  elements.treeSvg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
  elements.treeSvg.setAttribute("width", String(layout.width * zoom));
  elements.treeSvg.setAttribute("height", String(layout.height * zoom));
  elements.canvasStage.style.width = `${layout.width * zoom}px`;
  elements.canvasStage.style.height = `${layout.height * zoom}px`;

  const focusNodeId = tabState.pendingFocusNodeId || (!tabState.hasPositioned ? taxonomyIndex.roots[0] : null);
  if (focusNodeId) {
    const focusPosition = layout.positions.get(focusNodeId);
    tabState.scrollLeft = focusPosition
      ? Math.max(0, (focusPosition.x + layout.nodeWidth / 2) * zoom - elements.canvasScroll.clientWidth / 2)
      : 0;
    tabState.scrollTop = focusPosition
      ? Math.max(0, (focusPosition.y + layout.nodeHeight / 2) * zoom - elements.canvasScroll.clientHeight / 2)
      : 0;
    tabState.hasPositioned = true;
    tabState.pendingFocusNodeId = null;
  }

  const edgeLayer = createSvgElement("g", { "aria-hidden": "true" });
  for (const [parentId, childId] of layout.visibleEdges) {
    const parent = layout.positions.get(parentId);
    const child = layout.positions.get(childId);
    const startX = parent.x + layout.nodeWidth;
    const startY = parent.y + layout.nodeHeight / 2;
    const endX = child.x;
    const endY = child.y + layout.nodeHeight / 2;
    const curve = Math.max(35, (endX - startX) * 0.48);
    const path = createSvgElement("path", {
      class: "tree-edge",
      d: `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`,
    });
    edgeLayer.append(path);
  }
  elements.treeSvg.append(edgeLayer);

  const nodeLayer = createSvgElement("g");
  for (const [nodeId, position] of layout.positions) {
    const node = taxonomyIndex.nodeMap.get(nodeId);
    const nodeTitle = displayNodeTitle(config.taxonomyId, node);
    const group = createSvgElement("g", {
      class: `tree-node depth-${position.depth}${nodeId === tabState.selectedNodeId ? " is-selected" : ""}`,
      transform: `translate(${position.x}, ${position.y})`,
      tabindex: "0",
      role: "button",
      "aria-label": nodeTitle,
    });
    const title = createSvgElement("title");
    title.textContent = nodeTitle;
    group.append(title);
    group.append(
      createSvgElement("rect", {
        class: "node-box",
        width: layout.nodeWidth,
        height: layout.nodeHeight,
        rx: 8,
      }),
    );

    const lines = wrapLabel(nodeTitle);
    const label = createSvgElement("text", {
      class: "node-label",
      x: layout.nodeWidth / 2,
      y: layout.nodeHeight / 2 - ((lines.length - 1) * 8),
      "text-anchor": "middle",
    });
    lines.forEach((line, lineIndex) => {
      const tspan = createSvgElement("tspan", {
        x: layout.nodeWidth / 2,
        dy: lineIndex === 0 ? 0 : 16,
      });
      tspan.textContent = line;
      label.append(tspan);
    });
    group.append(label);

    const paperCount = papersForNode(config.taxonomyId, nodeId).length;
    if (paperCount) {
      const badgeX = 10;
      const badgeY = layout.nodeHeight - 9;
      group.append(
        createSvgElement("rect", {
          class: "node-count-badge",
          x: badgeX,
          y: badgeY,
          width: 24,
          height: 16,
          rx: 8,
        }),
      );
      const countText = createSvgElement("text", {
        class: "node-count-text",
        x: badgeX + 12,
        y: badgeY + 11.5,
        "text-anchor": "middle",
      });
      countText.textContent = paperCount > 99 ? "99+" : String(paperCount);
      group.append(countText);
    }

    if (position.allChildren.length) {
      const collapsed = tabState.collapsed.has(nodeId);
      const control = createSvgElement("g", {
        class: "collapse-control",
        transform: `translate(${layout.nodeWidth - 8}, ${layout.nodeHeight / 2 - 10})`,
        role: "button",
        "aria-label": collapsed ? `Expand ${nodeTitle}` : `Collapse ${nodeTitle}`,
      });
      control.append(createSvgElement("rect", { width: 20, height: 20, rx: 5 }));
      const symbol = createSvgElement("text", { x: 10, y: 14.5, "text-anchor": "middle" });
      symbol.textContent = collapsed ? "+" : "−";
      control.append(symbol);
      control.addEventListener("click", (event) => {
        event.stopPropagation();
        if (collapsed) {
          collapseDescendantBranches(taxonomyIndex, nodeId, tabState.collapsed);
          tabState.collapsed.delete(nodeId);
        } else {
          tabState.collapsed.add(nodeId);
        }
        renderTree();
      });
      group.append(control);
    }

    const selectNode = () => {
      tabState.selectedNodeId = nodeId;
      state.rightPanel = "overview";
      updatePanelTabs();
      renderTree();
      renderDetailPanel();
      replaceHistory();
    };
    group.addEventListener("click", selectNode);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNode();
      }
    });
    nodeLayer.append(group);
  }
  elements.treeSvg.append(nodeLayer);
}

function rqTimestamp(date) {
  return Date.parse(`${date}T00:00:00Z`);
}

function layoutResearchQuestions() {
  const graph = database.research_question_graph;
  const axisLeft = 330;
  const axisRight = RQ_GRAPH_WIDTH - 64;
  const startYear = Math.min(...graph.nodes.map((node) => Number(node.first_date.slice(0, 4))));
  const endYear = Math.max(...graph.nodes.map((node) => Number(node.first_date.slice(0, 4)))) + 1;
  const start = Date.UTC(startYear, 0, 1);
  const end = Date.UTC(endYear, 0, 1);
  const xForDate = (date) => axisLeft + ((rqTimestamp(date) - start) / (end - start)) * (axisRight - axisLeft);
  const nodePositions = new Map();
  const familyPositions = new Map();
  let laneTop = 190;

  for (const family of graph.families) {
    const nodes = [...(indexes.rqNodesByFamily.get(family.family_id) || [])].sort(
      (a, b) => rqTimestamp(a.first_date) - rqTimestamp(b.first_date) || a.rq_id.localeCompare(b.rq_id),
    );
    const trackEnds = [];
    const placed = [];
    for (const node of nodes) {
      const x = xForDate(node.first_date);
      let track = trackEnds.findIndex((lastX) => x - lastX >= RQ_NODE_WIDTH + 18);
      if (track < 0) {
        track = trackEnds.length;
        trackEnds.push(x);
      } else {
        trackEnds[track] = x;
      }
      placed.push({ node, x, track });
    }
    const laneHeight = Math.max(122, 74 + Math.max(1, trackEnds.length) * 45);
    const firstNodeY = laneTop + 66;
    for (const { node, x, track } of placed) {
      nodePositions.set(node.rq_id, { x, y: firstNodeY + track * 45, familyId: family.family_id });
    }
    familyPositions.set(family.family_id, { y: laneTop, height: laneHeight });
    laneTop += laneHeight;
  }

  return {
    width: RQ_GRAPH_WIDTH,
    height: Math.max(980, laneTop + 36),
    axisLeft,
    axisRight,
    axisY: 132,
    startYear,
    endYear,
    xForDate,
    nodePositions,
    familyPositions,
  };
}

function selectResearchQuestionItem(itemType, itemId, { focus = false } = {}) {
  if (itemType === "node" && !indexes.rqNodeMap.has(itemId)) return;
  if (itemType === "family" && !indexes.rqFamilyMap.has(itemId)) return;
  captureCanvasScroll();
  const tabState = state.tabs["research-questions"];
  tabState.selectedItemType = itemType;
  tabState.selectedNodeId = itemId;
  if (focus) tabState.pendingFocusNodeId = itemId;
  state.rightPanel = "overview";
  renderGraph();
  replaceHistory();
}

function appendResearchQuestionLegend(svg, layout) {
  const familyLayer = createSvgElement("g", { class: "rq-legend", "aria-hidden": "true" });
  const relationshipLabel = createSvgElement("text", { x: layout.axisLeft, y: 47, class: "rq-legend-heading" });
  relationshipLabel.textContent = localized({ en: "Relationship evidence", zh: "关系证据" });
  familyLayer.append(relationshipLabel);
  const evidenceItems = [
    ["direct-citation", localized({ en: "Direct citation", zh: "正文直接承接" })],
    ["same-lineage", localized({ en: "Same research lineage", zh: "同一研究脉络" })],
    ["analyst-inference", localized({ en: "Analyst inference", zh: "分析性推断" })],
  ];
  let x = layout.axisLeft + 210;
  for (const [status, labelText] of evidenceItems) {
    familyLayer.append(
      createSvgElement("line", {
        class: `rq-edge evidence-${status} legend-sample`,
        x1: x,
        y1: 42,
        x2: x + 46,
        y2: 42,
      }),
    );
    const label = createSvgElement("text", { x: x + 57, y: 47, class: "rq-legend-label" });
    label.textContent = labelText;
    familyLayer.append(label);
    x += Math.max(235, labelText.length * (state.language === "zh" ? 18 : 7.2) + 115);
  }
  svg.append(familyLayer);
}

function renderResearchQuestionGraph() {
  const graph = database.research_question_graph;
  const tabState = state.tabs["research-questions"];
  const layout = layoutResearchQuestions();
  const zoom = tabState.zoom;
  const selectedType = tabState.selectedItemType;
  const selectedId = tabState.selectedNodeId;
  const selectedNode = selectedType === "node" ? indexes.rqNodeMap.get(selectedId) : null;
  const selectedFamilyId = selectedType === "family" ? selectedId : selectedNode?.family_id;
  const neighborIds = new Set([selectedNode?.rq_id].filter(Boolean));
  for (const edge of selectedNode ? indexes.rqEdgesByNode.get(selectedNode.rq_id) || [] : []) {
    neighborIds.add(edge.source);
    neighborIds.add(edge.target);
  }

  elements.treeSvg.innerHTML = "";
  elements.treeSvg.setAttribute("aria-label", "Research question evolution graph");
  elements.treeSvg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
  elements.treeSvg.setAttribute("width", String(layout.width * zoom));
  elements.treeSvg.setAttribute("height", String(layout.height * zoom));
  elements.canvasStage.style.width = `${layout.width * zoom}px`;
  elements.canvasStage.style.height = `${layout.height * zoom}px`;

  appendResearchQuestionLegend(elements.treeSvg, layout);

  const axisLayer = createSvgElement("g", { class: "rq-axis", "aria-hidden": "true" });
  const axisTitle = createSvgElement("text", {
    x: layout.axisLeft,
    y: 86,
    class: "rq-axis-title",
  });
  axisTitle.textContent = localized({
    en: "First proposed (within corpus)",
    zh: "首次提出时间（corpus 内）",
  });
  axisLayer.append(axisTitle);
  axisLayer.append(
    createSvgElement("line", {
      class: "rq-axis-line",
      x1: layout.axisLeft,
      y1: layout.axisY,
      x2: layout.axisRight,
      y2: layout.axisY,
    }),
  );
  for (let year = layout.startYear; year <= layout.endYear; year += 1) {
    for (let quarter = 0; quarter < 4; quarter += 1) {
      if (year === layout.endYear && quarter > 0) continue;
      const date = `${year}-${String(quarter * 3 + 1).padStart(2, "0")}-01`;
      const x = layout.xForDate(date);
      axisLayer.append(
        createSvgElement("line", {
          class: quarter === 0 ? "rq-year-tick" : "rq-quarter-tick",
          x1: x,
          y1: layout.axisY - (quarter === 0 ? 10 : 5),
          x2: x,
          y2: layout.axisY + (quarter === 0 ? 10 : 5),
        }),
      );
      if (quarter === 0) {
        const label = createSvgElement("text", {
          class: "rq-year-label",
          x,
          y: layout.axisY - 17,
          "text-anchor": "middle",
        });
        label.textContent = String(year);
        axisLayer.append(label);
      }
    }
  }
  elements.treeSvg.append(axisLayer);

  const laneLayer = createSvgElement("g");
  for (const family of graph.families) {
    const position = layout.familyPositions.get(family.family_id);
    const isSelected = selectedType === "family" && selectedId === family.family_id;
    const isMuted = selectedFamilyId && family.family_id !== selectedFamilyId;
    const lane = createSvgElement("g", {
      class: `rq-family${isSelected ? " is-selected" : ""}${isMuted ? " is-muted" : ""}`,
      role: "button",
      tabindex: "0",
      "aria-label": localized({ en: family.label_en, zh: family.label_zh }),
    });
    lane.append(
      createSvgElement("line", {
        class: "rq-family-rule",
        x1: 24,
        y1: position.y,
        x2: layout.axisRight,
        y2: position.y,
      }),
    );
    lane.append(
      createSvgElement("rect", {
        class: "rq-family-hitbox",
        x: 24,
        y: position.y + 14,
        width: 295,
        height: 45,
        rx: 9,
      }),
    );
    lane.append(
      createSvgElement("circle", {
        cx: 39,
        cy: position.y + 36,
        r: 6,
        fill: RQ_FAMILY_COLORS[family.family_id] || "#7f8790",
      }),
    );
    const familyLabel = createSvgElement("text", {
      class: "rq-family-label",
      x: 53,
      y: position.y + 41,
    });
    familyLabel.textContent = localized({ en: family.label_en, zh: family.label_zh });
    lane.append(familyLabel);
    const activate = () => selectResearchQuestionItem("family", family.family_id);
    lane.addEventListener("click", activate);
    lane.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
    laneLayer.append(lane);
  }
  elements.treeSvg.append(laneLayer);

  const edgeLayer = createSvgElement("g", { "aria-hidden": "true" });
  for (const edge of graph.edges) {
    const source = layout.nodePositions.get(edge.source);
    const target = layout.nodePositions.get(edge.target);
    if (!source || !target) continue;
    const relatedToNode = selectedType === "node" && (edge.source === selectedId || edge.target === selectedId);
    const relatedToFamily =
      selectedType === "family" &&
      (source.familyId === selectedId || target.familyId === selectedId);
    const isMuted = selectedId && !relatedToNode && !relatedToFamily;
    const bend = Math.max(34, Math.min(145, Math.abs(target.x - source.x) * 0.2));
    const path = createSvgElement("path", {
      class: `rq-edge evidence-${edge.evidence_status}${relatedToNode || relatedToFamily ? " is-related" : ""}${isMuted ? " is-muted" : ""}`,
      d: `M ${source.x + RQ_NODE_WIDTH / 2} ${source.y} C ${source.x + RQ_NODE_WIDTH / 2 + bend} ${source.y}, ${target.x - RQ_NODE_WIDTH / 2 - bend} ${target.y}, ${target.x - RQ_NODE_WIDTH / 2} ${target.y}`,
    });
    const title = createSvgElement("title");
    title.textContent = `${edge.type} · ${edge.evidence_status}`;
    path.append(title);
    edgeLayer.append(path);
  }
  elements.treeSvg.append(edgeLayer);

  const nodeLayer = createSvgElement("g");
  for (const node of graph.nodes) {
    const position = layout.nodePositions.get(node.rq_id);
    const isSelected = selectedType === "node" && node.rq_id === selectedId;
    const isRelated = selectedType === "node" && neighborIds.has(node.rq_id);
    const isMuted =
      (selectedType === "node" && !isSelected && !isRelated) ||
      (selectedType === "family" && node.family_id !== selectedId);
    const group = createSvgElement("g", {
      class: `rq-node${isSelected ? " is-selected" : ""}${isRelated ? " is-related" : ""}${isMuted ? " is-muted" : ""}`,
      transform: `translate(${position.x - RQ_NODE_WIDTH / 2}, ${position.y - RQ_NODE_HEIGHT / 2})`,
      role: "button",
      tabindex: "0",
      "aria-label": `${node.display_code}: ${localized({ en: node.question_en, zh: node.question_zh })}`,
      style: `--rq-color: ${RQ_FAMILY_COLORS[node.family_id] || "#7f8790"}`,
    });
    const title = createSvgElement("title");
    title.textContent = `${node.display_code} · ${node.first_date}\n${localized({ en: node.question_en, zh: node.question_zh })}`;
    group.append(title);
    group.append(
      createSvgElement("rect", {
        width: RQ_NODE_WIDTH,
        height: RQ_NODE_HEIGHT,
        rx: 9,
      }),
    );
    const label = createSvgElement("text", {
      x: RQ_NODE_WIDTH / 2,
      y: 22,
      "text-anchor": "middle",
    });
    label.textContent = node.display_code;
    group.append(label);
    const activate = () => selectResearchQuestionItem("node", node.rq_id);
    group.addEventListener("click", activate);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
    nodeLayer.append(group);
  }
  elements.treeSvg.append(nodeLayer);

  const focusId = tabState.pendingFocusNodeId;
  if (focusId) {
    const nodePosition = layout.nodePositions.get(focusId);
    const familyPosition = layout.familyPositions.get(focusId);
    tabState.scrollLeft = nodePosition
      ? Math.max(0, nodePosition.x * zoom - elements.canvasScroll.clientWidth / 2)
      : 0;
    tabState.scrollTop = nodePosition
      ? Math.max(0, nodePosition.y * zoom - elements.canvasScroll.clientHeight / 2)
      : familyPosition
        ? 0
        : 0;
    tabState.pendingFocusNodeId = null;
  } else if (!tabState.hasPositioned) {
    tabState.scrollLeft = 0;
    tabState.scrollTop = 0;
  }
  tabState.hasPositioned = true;
}

function rolesForAuthor(author) {
  const roles = [];
  if (author.first_author_paper_count) roles.push("first");
  if (author.middle_author_paper_count) roles.push("middle");
  if (author.last_author_paper_count) roles.push("last");
  return roles;
}

function authorMatchesRoleFilter(author) {
  return rolesForAuthor(author).some((role) => state.authorRoles.has(role));
}

function visibleAuthors() {
  return database.author_network.nodes.filter(authorMatchesRoleFilter);
}

function ensureAuthorVisible(author) {
  if (!author || authorMatchesRoleFilter(author)) return;
  const [role] = rolesForAuthor(author);
  if (role) state.authorRoles.add(role);
}

function renderAuthorGraph() {
  const tabState = state.tabs.authors;
  const zoom = tabState.zoom;
  const authors = visibleAuthors();
  const visibleIds = new Set(authors.map((author) => author.author_id));
  elements.authorVisibleCount.textContent = `${authors.length}/${database.author_network.nodes.length} authors`;
  if (!visibleIds.has(tabState.selectedNodeId)) {
    const replacement = [...authors].sort(
      (a, b) => b.paper_count - a.paper_count || b.weighted_degree - a.weighted_degree,
    )[0];
    tabState.selectedNodeId = replacement?.author_id || null;
    tabState.pendingFocusNodeId = replacement?.author_id || null;
  }
  const selectedAuthor = indexes.authorNodeMap.get(tabState.selectedNodeId);
  const relatedCounts = new Map(
    (selectedAuthor?.collaborators || []).map((collaborator) => [collaborator.author_id, collaborator.paper_count]),
  );

  elements.treeSvg.innerHTML = "";
  elements.treeSvg.setAttribute("aria-label", "Author collaboration network");
  elements.treeSvg.setAttribute("viewBox", `0 0 ${AUTHOR_GRAPH_WIDTH} ${AUTHOR_GRAPH_HEIGHT}`);
  elements.treeSvg.setAttribute("width", String(AUTHOR_GRAPH_WIDTH * zoom));
  elements.treeSvg.setAttribute("height", String(AUTHOR_GRAPH_HEIGHT * zoom));
  elements.canvasStage.style.width = `${AUTHOR_GRAPH_WIDTH * zoom}px`;
  elements.canvasStage.style.height = `${AUTHOR_GRAPH_HEIGHT * zoom}px`;

  const focusAuthorId = tabState.pendingFocusNodeId || (!tabState.hasPositioned ? tabState.selectedNodeId : null);
  if (focusAuthorId) {
    const focusPosition = indexes.authorLayout.get(focusAuthorId);
    tabState.scrollLeft = focusPosition
      ? Math.max(0, focusPosition.x * zoom - elements.canvasScroll.clientWidth / 2)
      : 0;
    tabState.scrollTop = focusPosition
      ? Math.max(0, focusPosition.y * zoom - elements.canvasScroll.clientHeight / 2)
      : 0;
    tabState.hasPositioned = true;
    tabState.pendingFocusNodeId = null;
  }

  const edgeLayer = createSvgElement("g", { "aria-hidden": "true" });
  const orderedEdges = database.author_network.edges
    .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
    .sort((a, b) => {
      const aRelated = a.source === tabState.selectedNodeId || a.target === tabState.selectedNodeId;
      const bRelated = b.source === tabState.selectedNodeId || b.target === tabState.selectedNodeId;
      return Number(aRelated) - Number(bRelated);
    });
  for (const edge of orderedEdges) {
    const source = indexes.authorLayout.get(edge.source);
    const target = indexes.authorLayout.get(edge.target);
    if (!source || !target) continue;
    const isRelated = edge.source === tabState.selectedNodeId || edge.target === tabState.selectedNodeId;
    edgeLayer.append(
      createSvgElement("line", {
        class: `author-edge${isRelated ? " is-related" : " is-muted"}`,
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        "data-paper-count": edge.paper_count,
        "stroke-width": Math.min(5, 0.7 + edge.paper_count * 0.65),
      }),
    );
  }
  elements.treeSvg.append(edgeLayer);

  const nodeLayer = createSvgElement("g");
  for (const author of authors) {
    const position = indexes.authorLayout.get(author.author_id);
    if (!position) continue;
    const isSelected = author.author_id === tabState.selectedNodeId;
    const isRelated = relatedCounts.has(author.author_id);
    const isMuted = selectedAuthor && !isSelected && !isRelated;
    const group = createSvgElement("g", {
      class: `author-node${isSelected ? " is-selected" : ""}${isRelated ? " is-related" : ""}${isMuted ? " is-muted" : ""}`,
      transform: `translate(${position.x}, ${position.y})`,
      tabindex: "0",
      role: "button",
      "aria-label": `${author.canonical_name}, ${author.paper_count} corpus papers`,
    });
    const title = createSvgElement("title");
    title.textContent = `${author.canonical_name} · ${author.paper_count} papers · ${author.coauthor_count} collaborators`;
    group.append(title);
    group.append(
      createSvgElement("circle", {
        r: position.radius,
      }),
    );

    if (isSelected || author.paper_count >= 4 || (isRelated && relatedCounts.get(author.author_id) >= 2)) {
      const label = createSvgElement("text", {
        class: "author-label",
        x: position.radius + 6,
        y: 4,
      });
      label.textContent = author.canonical_name;
      group.append(label);
    }

    const activate = () => selectAuthor(author.author_id);
    group.addEventListener("click", activate);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
    nodeLayer.append(group);
  }
  elements.treeSvg.append(nodeLayer);
}

function nodePath(taxonomyIndex, nodeId) {
  const path = [];
  let current = taxonomyIndex.nodeMap.get(nodeId);
  while (current) {
    path.unshift(current);
    current = current.parent_id ? taxonomyIndex.nodeMap.get(current.parent_id) : null;
  }
  return path;
}

function renderDetailPanel() {
  if (state.activeTab === "research-questions") {
    renderResearchQuestionDetailPanel();
    return;
  }
  if (state.activeTab === "authors") {
    renderAuthorDetailPanel();
    return;
  }
  const config = taxonomyConfigForTab();
  if (!config?.index) {
    elements.detailContent.innerHTML = "";
    return;
  }
  const selectedNodeId = state.tabs[state.activeTab].selectedNodeId;
  const node = config.index.nodeMap.get(selectedNodeId);
  if (!node) return;
  const papers = papersForNode(config.taxonomyId, selectedNodeId);
  if (state.rightPanel === "papers") renderNodePapers(config.taxonomyId, node, papers);
  else renderNodeOverview(config.taxonomyId, config.index, node, papers);
}

function papersForResearchQuestionSelection() {
  const tabState = state.tabs["research-questions"];
  const nodes =
    tabState.selectedItemType === "family"
      ? indexes.rqNodesByFamily.get(tabState.selectedNodeId) || []
      : [indexes.rqNodeMap.get(tabState.selectedNodeId)].filter(Boolean);
  const grouped = new Map();
  for (const node of nodes) {
    for (const [role, paperIds] of [
      ["primary", node.primary_paper_ids || []],
      ["secondary", node.secondary_paper_ids || []],
    ]) {
      for (const paperId of paperIds) {
        if (!grouped.has(paperId)) grouped.set(paperId, new Set());
        grouped.get(paperId).add(role);
      }
    }
  }
  return [...grouped.entries()]
    .map(([paperId, roles]) => ({ paper: database.papers[paperId], roles }))
    .filter((entry) => entry.paper);
}

function renderResearchQuestionDetailPanel() {
  const tabState = state.tabs["research-questions"];
  const family =
    tabState.selectedItemType === "family" ? indexes.rqFamilyMap.get(tabState.selectedNodeId) : null;
  const node = tabState.selectedItemType === "node" ? indexes.rqNodeMap.get(tabState.selectedNodeId) : null;
  if (!family && !node) {
    elements.detailContent.innerHTML = "";
    return;
  }
  const papers = papersForResearchQuestionSelection();
  if (state.rightPanel === "papers") renderResearchQuestionPapers(family, node, papers);
  else if (family) renderResearchQuestionFamilyOverview(family, papers);
  else renderResearchQuestionNodeOverview(node, papers);
}

function renderResearchQuestionFamilyOverview(family, papers) {
  const nodes = indexes.rqNodesByFamily.get(family.family_id) || [];
  elements.detailContent.innerHTML = `
    <div class="node-path"><span>${escapeHtml(localized({ en: "Research Question family", zh: "研究问题板块" }))}</span></div>
    <h2>${escapeHtml(localized({ en: family.label_en, zh: family.label_zh }))}</h2>
    <div class="detail-statline">
      <span class="stat-pill">${nodes.length} RQs</span>
      <span class="stat-pill">${papers.length} corpus papers</span>
    </div>
    <div class="rq-guiding-question">
      <span>${escapeHtml(localized({ en: "Guiding question", zh: "引导问题" }))}</span>
      <p>${escapeHtml(localized({ en: family.guiding_question_en, zh: family.guiding_question_zh }))}</p>
    </div>
    <h3>${escapeHtml(localized({ en: "Introduction", zh: "介绍" }))}</h3>
    <div class="overview-copy">${renderProse(localized({ en: family.meaning_en, zh: family.meaning_zh }))}</div>
    <h3>${escapeHtml(localized({ en: "Evolution summary", zh: "演化总结" }))}</h3>
    <div class="overview-copy">${renderProse(localized({ en: family.evolution_en, zh: family.evolution_zh }))}</div>
  `;
  renderMath(elements.detailContent);
}

function renderResearchQuestionNodeOverview(node, papers) {
  const family = indexes.rqFamilyMap.get(node.family_id);
  const primaryCount = (node.primary_paper_ids || []).length;
  const secondaryCount = (node.secondary_paper_ids || []).filter(
    (paperId) => !(node.primary_paper_ids || []).includes(paperId),
  ).length;
  elements.detailContent.innerHTML = `
    <div class="node-path">
      <span>${escapeHtml(localized({ en: family.label_en, zh: family.label_zh }))}</span>
      <span class="path-separator">·</span>
      <span>${escapeHtml(node.display_code)}</span>
    </div>
    <h2>${escapeHtml(localized({ en: node.question_en, zh: node.question_zh }))}</h2>
    <div class="rq-first-date">${escapeHtml(localized({ en: "First proposed", zh: "首次提出" }))}: ${escapeHtml(node.first_date)}</div>
    <div class="detail-statline">
      <span class="stat-pill">${primaryCount} primary papers</span>
      <span class="stat-pill">${secondaryCount} secondary papers</span>
    </div>
    <h3>${escapeHtml(localized({ en: "Introduction", zh: "介绍" }))}</h3>
    <div class="overview-copy">${renderProse(localized({ en: node.introduction_en, zh: node.introduction_zh }))}</div>
    <h3>${escapeHtml(localized({ en: "Current progress", zh: "当前进展" }))}</h3>
    <div class="overview-copy">${renderProse(localized({ en: node.progress_en, zh: node.progress_zh }))}</div>
  `;
  renderMath(elements.detailContent);
}

function renderResearchQuestionPapers(family, node, papers) {
  const sortedPapers = sortPaperEntries(papers);
  const primary = sortedPapers
    .filter((entry) => entry.roles.has("primary"))
    .map((entry) => ({ ...entry, displayRole: "primary" }));
  const secondary = sortedPapers
    .filter((entry) => entry.roles.has("secondary") && !entry.roles.has("primary"))
    .map((entry) => ({ ...entry, displayRole: "secondary" }));
  const title = family
    ? localized({ en: family.label_en, zh: family.label_zh })
    : `${node.display_code} · ${localized({ en: node.question_en, zh: node.question_zh })}`;
  elements.detailContent.innerHTML = `
    <div class="paper-list-title-row">
      <h2>${escapeHtml(title)}</h2>
      <label class="paper-sort-control">
        <span>Sort by</span>
        <select id="paper-sort">
          <option value="year-desc"${state.paperSort === "year-desc" ? " selected" : ""}>Year: newest first</option>
          <option value="year-asc"${state.paperSort === "year-asc" ? " selected" : ""}>Year: oldest first</option>
        </select>
      </label>
    </div>
    <div class="detail-statline"><span class="stat-pill">${papers.length} papers</span></div>
    ${paperGroupHtml("Primary", primary)}
    ${paperGroupHtml("Secondary", secondary)}
  `;
  elements.detailContent.querySelector("#paper-sort").addEventListener("change", (event) => {
    state.paperSort = event.target.value;
    renderResearchQuestionDetailPanel();
  });
  elements.detailContent.querySelectorAll("[data-paper-id]").forEach((button) => {
    button.addEventListener("click", () => openPaper(button.dataset.paperId));
  });
}

function renderNodeOverview(taxonomyId, taxonomyIndex, node, papers) {
  const path = nodePath(taxonomyIndex, node.node_id);
  const primaryCount = papers.filter((entry) => entry.roles.has("primary")).length;
  const secondaryCount = papers.filter((entry) => entry.roles.has("secondary")).length;
  elements.detailContent.innerHTML = `
    <div class="node-path">
      ${path.map((item, index) => `${index ? '<span class="path-separator">·</span>' : ""}<span>${escapeHtml(displayNodeTitle(taxonomyId, item))}</span>`).join("")}
    </div>
    <h2>${escapeHtml(displayNodeTitle(taxonomyId, node))}</h2>
    <div class="detail-statline">
      <span class="stat-pill">${primaryCount} primary papers</span>
      <span class="stat-pill">${secondaryCount} secondary papers</span>
    </div>
    <div class="overview-copy">${renderProse(localized(node.introduction))}</div>
  `;
  renderMath(elements.detailContent);
}

function renderAuthorDetailPanel() {
  const author = indexes.authorNodeMap.get(state.tabs.authors.selectedNodeId);
  if (!author) {
    elements.detailContent.innerHTML = "";
    return;
  }
  if (state.rightPanel === "papers") renderAuthorPapers(author);
  else renderAuthorOverview(author);
}

function renderAuthorOverview(author) {
  const affiliations = (author.current_affiliations || [])
    .map((affiliation) => affiliation.name)
    .filter(Boolean);
  const profileLinks = [
    [localized({ en: "Homepage", zh: "个人主页" }), author.profiles?.homepage?.url],
    ["Google Scholar", author.profiles?.google_scholar?.url],
  ].filter(([, url]) => url);
  const frequentCollaborators = author.collaborators.slice(0, 10);
  const papersLabel = localized({ en: "papers", zh: "篇论文" });
  const firstAuthorLabel = localized({ en: "first-author", zh: "篇第一作者" });
  const lastAuthorLabel = localized({ en: "last-author", zh: "篇末位作者" });
  const collaboratorsLabel = localized({ en: "collaborators", zh: "位合作者" });
  elements.detailContent.innerHTML = `
    <h2>${escapeHtml(author.canonical_name)}</h2>
    ${
      affiliations.length
        ? `<div class="author-affiliations" aria-label="${escapeHtml(localized({ en: "Current affiliations", zh: "当前机构" }))}">${affiliations
            .map((name) => `<span>${escapeHtml(name)}</span>`)
            .join('<span class="affiliation-separator" aria-hidden="true">·</span>')}</div>`
        : ""
    }
    ${
      profileLinks.length
        ? `<div class="author-profile-links">${profileLinks
            .map(
              ([label, url]) =>
                `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a>`,
            )
            .join("")}</div>`
        : ""
    }
    <h3>${escapeHtml(localized({ en: "Corpus activity", zh: "Corpus 活跃度" }))}</h3>
    <p class="author-activity-line">
      <strong>${author.paper_count}</strong> ${papersLabel}
      <span>·</span>
      <strong>${author.first_author_paper_count}</strong> ${firstAuthorLabel}
      <span>·</span>
      <strong>${author.last_author_paper_count}</strong> ${lastAuthorLabel}
    </p>
    <p class="author-collaborator-count"><strong>${author.coauthor_count}</strong> ${collaboratorsLabel}</p>
    <h3 class="collaborator-heading">${escapeHtml(localized({ en: "Frequent collaborators", zh: "常见合作者" }))}</h3>
    <div class="collaborator-list">
      ${
        frequentCollaborators.length
          ? frequentCollaborators
              .map((collaborator) => {
                const collaboratorAuthor = indexes.authorNodeMap.get(collaborator.author_id);
                if (!collaboratorAuthor) return "";
                const sharedLabel = localized({
                  en: `${collaborator.paper_count} shared ${collaborator.paper_count === 1 ? "paper" : "papers"}`,
                  zh: `${collaborator.paper_count} 篇共同论文`,
                });
                return `
                  <button type="button" class="collaborator-row" data-collaborator-id="${escapeHtml(collaborator.author_id)}">
                    <span>${escapeHtml(collaboratorAuthor.canonical_name)}</span>
                    <span>${escapeHtml(sharedLabel)}</span>
                  </button>
                `;
              })
              .join("")
          : `<p class="unclassified">${escapeHtml(localized({ en: "No collaborators in the corpus.", zh: "Corpus 中暂无合作者。" }))}</p>`
      }
    </div>
  `;
  elements.detailContent.querySelectorAll("[data-collaborator-id]").forEach((button) => {
    button.addEventListener("click", () => selectAuthor(button.dataset.collaboratorId, { focus: true }));
  });
}

function authorPaperRole(author, paperId) {
  const isFirst = author.first_author_paper_ids.includes(paperId);
  const isMiddle = author.middle_author_paper_ids.includes(paperId);
  const isLast = author.last_author_paper_ids.includes(paperId);
  if (isFirst && isLast) return "first & last author";
  if (isFirst) return "first author";
  if (isMiddle) return "middle author";
  if (isLast) return "last author";
  return "coauthor";
}

function renderAuthorPapers(author) {
  const papers = sortPaperEntries(
    author.paper_ids
      .map((paperId) => ({
        paper: database.papers[paperId],
        displayRole: authorPaperRole(author, paperId),
      }))
      .filter((entry) => entry.paper),
  );
  elements.detailContent.innerHTML = `
    <div class="paper-list-title-row">
      <h2>${escapeHtml(author.canonical_name)}</h2>
      <label class="paper-sort-control">
        <span>Sort by</span>
        <select id="paper-sort">
          <option value="year-desc"${state.paperSort === "year-desc" ? " selected" : ""}>Year: newest first</option>
          <option value="year-asc"${state.paperSort === "year-asc" ? " selected" : ""}>Year: oldest first</option>
        </select>
      </label>
    </div>
    <div class="detail-statline"><span class="stat-pill">${papers.length} corpus papers</span></div>
    ${paperGroupHtml("Papers", papers)}
  `;
  elements.detailContent.querySelector("#paper-sort").addEventListener("change", (event) => {
    state.paperSort = event.target.value;
    renderAuthorDetailPanel();
  });
  elements.detailContent.querySelectorAll("[data-paper-id]").forEach((button) => {
    button.addEventListener("click", () => openPaper(button.dataset.paperId));
  });
}

function selectAuthor(authorId, { focus = false } = {}) {
  if (!indexes.authorNodeMap.has(authorId)) return;
  captureCanvasScroll();
  const tabState = state.tabs.authors;
  tabState.selectedNodeId = authorId;
  if (focus) tabState.pendingFocusNodeId = authorId;
  state.rightPanel = "overview";
  renderGraph();
  replaceHistory();
}

function renderNodePapers(taxonomyId, node, papers) {
  const sortedPapers = sortPaperEntries(papers);
  const primary = sortedPapers
    .filter((entry) => entry.roles.has("primary"))
    .map((entry) => ({ ...entry, displayRole: "primary" }));
  const secondary = sortedPapers
    .filter((entry) => entry.roles.has("secondary"))
    .map((entry) => ({ ...entry, displayRole: "secondary" }));
  elements.detailContent.innerHTML = `
    <div class="paper-list-title-row">
      <h2>${escapeHtml(displayNodeTitle(taxonomyId, node))}</h2>
      <label class="paper-sort-control">
        <span>Sort by</span>
        <select id="paper-sort">
          <option value="year-desc"${state.paperSort === "year-desc" ? " selected" : ""}>Year: newest first</option>
          <option value="year-asc"${state.paperSort === "year-asc" ? " selected" : ""}>Year: oldest first</option>
        </select>
      </label>
    </div>
    <div class="detail-statline"><span class="stat-pill">${papers.length} papers</span></div>
    ${paperGroupHtml("Primary", primary)}
    ${paperGroupHtml("Secondary", secondary)}
  `;
  elements.detailContent.querySelector("#paper-sort").addEventListener("change", (event) => {
    state.paperSort = event.target.value;
    renderDetailPanel();
  });
  elements.detailContent.querySelectorAll("[data-paper-id]").forEach((button) => {
    button.addEventListener("click", () => openPaper(button.dataset.paperId));
  });
}

function sortPaperEntries(entries) {
  const year = (entry) => Number.parseInt(entry.paper.year, 10);
  return [...entries].sort((a, b) => {
    const yearA = year(a);
    const yearB = year(b);
    const missingA = Number.isNaN(yearA);
    const missingB = Number.isNaN(yearB);
    if (missingA !== missingB) return missingA ? 1 : -1;
    if (!missingA && yearA !== yearB) {
      return state.paperSort === "year-asc" ? yearA - yearB : yearB - yearA;
    }
    return a.paper.title.localeCompare(b.paper.title, "en");
  });
}

function paperGroupHtml(label, entries) {
  if (!entries.length) return "";
  return `
    <section class="paper-list-group">
      <div class="paper-list-heading"><span>${label}</span><span>${entries.length}</span></div>
      ${entries.map(paperCardHtml).join("")}
    </section>
  `;
}

function paperCardHtml(entry) {
  const paper = entry.paper;
  const venue = paper.venue || paper.publication_type || "";
  return `
    <button type="button" class="paper-card" data-paper-id="${escapeHtml(paper.paper_id)}">
      <span class="paper-card-title">${escapeHtml(paper.title)}</span>
      <span class="paper-card-meta">
        ${paper.year ? `<span>${escapeHtml(paper.year)}</span>` : ""}
        ${venue ? `<span>${escapeHtml(venue)}</span>` : ""}
        <span class="relation-pill ${["secondary", "related"].includes(entry.displayRole) ? entry.displayRole : ""}">${escapeHtml(entry.displayRole)}</span>
      </span>
    </button>
  `;
}

function openPaper(paperId) {
  const paper = database.papers[paperId];
  if (!paper) return;
  captureCanvasScroll();
  state.paperSource = {
    tab: state.activeTab,
    nodeId: state.tabs[state.activeTab]?.selectedNodeId || null,
  };
  state.view = "paper";
  state.currentPaperId = paperId;
  state.returnPaperId = null;
  state.paperScroll = 0;
  pushHistory();
  render();
}

function paperBackLabel() {
  const tab = state.paperSource?.tab;
  return tab && TAB_CONFIG[tab] ? TAB_CONFIG[tab].title : "visualization";
}

function paperRelations(paperId, taxonomyId) {
  const order = { primary: 0, secondary: 1 };
  return (indexes.relationsByPaper.get(paperId) || [])
    .filter((relation) => relation.taxonomy_id === taxonomyId)
    .sort((a, b) => order[a.relation_role] - order[b.relation_role]);
}

function relationLabel(taxonomyId, role) {
  if (taxonomyId === "techniques") {
    const entry = database.controlled_vocabulary.taxonomy_relation_roles.techniques[role];
    return localized(entry.label);
  }
  const labels = {
    "research-object": {
      en: { primary: "Primary Object", secondary: "Secondary Object" },
      zh: { primary: "主要对象", secondary: "辅助对象" },
    },
    "application-scenarios": {
      en: { primary: "Primary Application", secondary: "Secondary Application" },
      zh: { primary: "主要应用", secondary: "辅助应用" },
    },
  };
  return labels[taxonomyId]?.[state.language]?.[role] || role;
}

function taxonomyAttributeHtml(label, tabId, taxonomyId, paperId) {
  const taxonomyIndex = indexes.taxonomyIndexes[taxonomyId];
  const relations = paperRelations(paperId, taxonomyId);
  return `
    <div class="attribute-group">
      <div class="attribute-label">${escapeHtml(label)}</div>
      <div class="attribute-relations">
        ${
          relations.length
            ? relations
                .map((relation) => {
                  const fullPath = nodePath(taxonomyIndex, relation.node_id);
                  const path = fullPath.length > 1 ? fullPath.slice(1) : fullPath;
                  return `
                    <div class="relation-row">
                      <div class="relation-row-label">${escapeHtml(relationLabel(taxonomyId, relation.relation_role))}</div>
                      <div class="paper-path">
                        ${path
                          .map(
                            (node, index) =>
                              `${index ? '<span class="path-separator">·</span>' : ""}<button type="button" class="path-node" data-taxonomy-tab="${tabId}" data-node-id="${escapeHtml(node.node_id)}">${escapeHtml(displayNodeTitle(taxonomyId, node))}</button>`,
                          )
                          .join("")}
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<span class="unclassified">${state.language === "zh" ? "尚未分类" : "Unclassified"}</span>`
        }
      </div>
    </div>
  `;
}

function emptyTaxonomyAttributeHtml(label) {
  return `
    <div class="attribute-group">
      <div class="attribute-label">${escapeHtml(label)}</div>
      <div><span class="unclassified">${state.language === "zh" ? "尚未分类" : "Unclassified"}</span></div>
    </div>
  `;
}

function researchQuestionAttributeHtml(paperId) {
  const assignments = indexes.rqAssignmentsByPaper.get(paperId) || [];
  const ordered = [...assignments].sort((a, b) => {
    const roleOrder = { primary: 0, secondary: 1 };
    return roleOrder[a.role] - roleOrder[b.role] || a.rq_id.localeCompare(b.rq_id);
  });
  return `
    <div class="attribute-group">
      <div class="attribute-label">${escapeHtml(localized({ en: "Research Questions", zh: "研究问题" }))}</div>
      <div class="attribute-relations">
        ${
          ordered.length
            ? ordered
                .map((assignment) => {
                  const node = indexes.rqNodeMap.get(assignment.rq_id);
                  if (!node) return "";
                  const roleLabel = localized(
                    assignment.role === "primary"
                      ? { en: "Primary Research Question", zh: "主要研究问题" }
                      : { en: "Secondary Research Question", zh: "次要研究问题" },
                  );
                  return `
                    <div class="relation-row">
                      <div class="relation-row-label">${escapeHtml(roleLabel)}</div>
                      <div class="paper-path">
                        <button type="button" class="path-node rq-path-node" data-rq-id="${escapeHtml(node.rq_id)}">
                          <strong>${escapeHtml(node.display_code)}</strong>
                          <span>${escapeHtml(localized({ en: node.question_en, zh: node.question_zh }))}</span>
                        </button>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<span class="unclassified">${state.language === "zh" ? "尚未分类" : "Unclassified"}</span>`
        }
      </div>
    </div>
  `;
}

function facetHtml(attributeKey, value) {
  const definition = database.controlled_vocabulary.paper_attributes[attributeKey];
  const valueDefinition = definition?.values?.[value];
  if (!definition) return "";
  return `
    <div class="attribute-group">
      <div class="attribute-label facet-label">
        <span class="attribute-label-title">${escapeHtml(localized(definition.label))}</span>
        <p class="attribute-label-description">${escapeHtml(localized(definition.description))}</p>
        ${definition.note ? `<p class="attribute-label-note">${escapeHtml(localized(definition.note))}</p>` : ""}
      </div>
      <div class="facet-card">
        ${
          valueDefinition
            ? `<div class="facet-value"><strong>${escapeHtml(localized(valueDefinition.label))}</strong><code>${escapeHtml(value)}</code></div>
               <p class="facet-value-description">${escapeHtml(localized(valueDefinition.description))}</p>`
            : `<div class="facet-value"><span class="unclassified">${state.language === "zh" ? "尚未分类" : "Unclassified"}</span></div>`
        }
      </div>
    </div>
  `;
}

function renderPaper() {
  const paper = database.papers[state.currentPaperId];
  if (!paper) {
    elements.paperView.innerHTML = '<div class="paper-article"><h1>Paper not found</h1></div>';
    return;
  }

  const factParts = [paper.year, paper.earliest_public_date, paper.venue, paper.publication_type].filter(Boolean);
  const links = [
    ["Paper", paper.links?.primary],
    ["PDF", paper.links?.pdf],
    ["Code", paper.links?.code],
  ].filter(([, url]) => url);
  const identifiers = [
    ["DOI", paper.identifiers?.doi],
    ["arXiv", paper.identifiers?.arxiv_id],
    ["OpenReview", paper.identifiers?.openreview_id],
  ].filter(([, value]) => value);
  const aiSummary = normalizeImplicitSummaryMath(
    paper.ai_summary?.[state.language] || paper.ai_summary?.en || "",
  );

  elements.paperView.innerHTML = `
    <article class="paper-article">
      <button type="button" class="paper-back" id="paper-back"><span aria-hidden="true">←</span> Back to ${escapeHtml(paperBackLabel())}</button>
      <h1 class="paper-title">${escapeHtml(paper.title)}</h1>
      <div class="paper-facts">${factParts.map((part) => `<span>${escapeHtml(part)}</span>`).join("")}</div>
      <div class="paper-authors">
        ${paper.authors.map((author) => `<button type="button" class="author-link" data-author-id="${escapeHtml(author.author_id)}">${escapeHtml(author.name)}</button>`).join("")}
      </div>
      ${links.length ? `<div class="paper-links">${links.map(([label, url]) => `<a class="paper-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label} ↗</a>`).join("")}</div>` : ""}
      ${identifiers.length ? `<div class="identifier-row">${identifiers.map(([label, value]) => `<span>${label}: <code>${escapeHtml(value)}</code></span>`).join("")}</div>` : ""}

      <section class="paper-section">
        <div class="paper-section-header">
          <h2>Abstract</h2>
        </div>
        <p class="abstract-copy">${escapeHtml(paper.abstract?.[state.language] || paper.abstract?.en || "")}</p>
      </section>

      <section class="paper-section ai-summary-section">
        <div class="paper-section-header">
          <h2>${state.language === "zh" ? "AI 摘要" : "AI Summary"}</h2>
        </div>
        <div class="ai-summary-copy">${renderProse(aiSummary)}</div>
      </section>

      <section class="paper-section">
        <div class="paper-section-header"><h2>Attributes</h2></div>
        ${researchQuestionAttributeHtml(paper.paper_id)}
        ${taxonomyAttributeHtml(localized({ en: "Techniques", zh: "技术" }), "techniques", "techniques", paper.paper_id)}
        ${taxonomyAttributeHtml(localized({ en: "Target Objects", zh: "目标对象" }), "target-objects", "research-object", paper.paper_id)}
        ${taxonomyAttributeHtml(localized({ en: "Applications", zh: "应用" }), "applications", "application-scenarios", paper.paper_id)}
        ${facetHtml("contribution_role", paper.attributes?.contribution_role)}
        ${facetHtml("evidence_strength", paper.attributes?.evidence_strength)}
        ${facetHtml("modality", paper.attributes?.modality)}
      </section>

      <details class="why-included">
        <summary>Why it is included</summary>
        <p>${escapeHtml(paper.inclusion_reason || "No inclusion reason is available.")}</p>
      </details>
    </article>
  `;
  renderMath(elements.paperView);

  document.querySelector("#paper-back").addEventListener("click", () => history.back());
  elements.paperView.querySelectorAll("[data-taxonomy-tab]").forEach((button) => {
    button.addEventListener("click", () => openTaxonomyFromPaper(button.dataset.taxonomyTab, button.dataset.nodeId));
  });
  elements.paperView.querySelectorAll("[data-rq-id]").forEach((button) => {
    button.addEventListener("click", () => openResearchQuestionFromPaper(button.dataset.rqId));
  });
  elements.paperView.querySelectorAll("[data-author-id]").forEach((button) => {
    button.addEventListener("click", () => openAuthorsFromPaper(button.dataset.authorId));
  });
  requestAnimationFrame(() => {
    elements.paperView.scrollTop = state.paperScroll;
  });
}

function expandPath(tabId, nodeId) {
  const config = taxonomyConfigForTab(tabId);
  if (!config?.index) return;
  for (const node of nodePath(config.index, nodeId)) state.tabs[tabId].collapsed.delete(node.node_id);
}

function openTaxonomyFromPaper(tabId, nodeId) {
  const paperId = state.currentPaperId;
  state.paperScroll = elements.paperView.scrollTop;
  state.activeTab = tabId;
  state.tabs[tabId].selectedNodeId = nodeId;
  state.tabs[tabId].pendingFocusNodeId = nodeId;
  expandPath(tabId, nodeId);
  state.returnPaperId = paperId;
  state.currentPaperId = null;
  state.view = "graph";
  state.rightPanel = "overview";
  pushHistory();
  render();
}

function openAuthorsFromPaper(authorId) {
  const paperId = state.currentPaperId;
  state.paperScroll = elements.paperView.scrollTop;
  state.activeTab = "authors";
  const author = indexes.authorNodeMap.get(authorId);
  if (author) {
    ensureAuthorVisible(author);
    state.tabs.authors.selectedNodeId = authorId;
    state.tabs.authors.pendingFocusNodeId = authorId;
  }
  state.returnPaperId = paperId;
  state.currentPaperId = null;
  state.view = "graph";
  state.rightPanel = "overview";
  pushHistory();
  render();
}

function openResearchQuestionFromPaper(rqId) {
  if (!indexes.rqNodeMap.has(rqId)) return;
  const paperId = state.currentPaperId;
  state.paperScroll = elements.paperView.scrollTop;
  state.activeTab = "research-questions";
  state.tabs["research-questions"].selectedItemType = "node";
  state.tabs["research-questions"].selectedNodeId = rqId;
  state.tabs["research-questions"].pendingFocusNodeId = rqId;
  state.returnPaperId = paperId;
  state.currentPaperId = null;
  state.view = "graph";
  state.rightPanel = "overview";
  pushHistory();
  render();
}

function setLanguage(language) {
  if (!['en', 'zh'].includes(language)) return;
  if (state.view === "paper") state.paperScroll = elements.paperView.scrollTop;
  state.language = language;
  render();
  updatePaperSearchCopy();
  if (!elements.paperSearchBackdrop.hidden) renderPaperSearchResults();
}

function setZoom(nextZoom) {
  const tabState = state.tabs[state.activeTab];
  const kind = TAB_CONFIG[state.activeTab].kind;
  if (!tabState || !["taxonomy", "authors", "research-questions"].includes(kind)) return;
  const oldZoom = tabState.zoom;
  const centerX = elements.canvasScroll.scrollLeft + elements.canvasScroll.clientWidth / 2;
  const centerY = elements.canvasScroll.scrollTop + elements.canvasScroll.clientHeight / 2;
  tabState.zoom = Math.min(1.8, Math.max(0.45, Math.round(nextZoom * 20) / 20));
  elements.zoomValue.textContent = `${Math.round(tabState.zoom * 100)}%`;
  if (kind === "authors") renderAuthorGraph();
  else if (kind === "research-questions") renderResearchQuestionGraph();
  else renderTree();
  requestAnimationFrame(() => {
    const ratio = tabState.zoom / oldZoom;
    elements.canvasScroll.scrollLeft = centerX * ratio - elements.canvasScroll.clientWidth / 2;
    elements.canvasScroll.scrollTop = centerY * ratio - elements.canvasScroll.clientHeight / 2;
  });
}

function bindInteractions() {
  elements.contactOpen.addEventListener("click", () => openContact());
  elements.paperSearchOpen.addEventListener("click", openPaperSearch);
  elements.paperSearchClose.addEventListener("click", () => closePaperSearch());
  elements.paperSearchBackdrop.addEventListener("click", (event) => {
    if (event.target === elements.paperSearchBackdrop) closePaperSearch();
  });
  elements.paperSearchInput.addEventListener("input", renderPaperSearchResults);
  elements.paperSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const firstResult = elements.paperSearchResults.querySelector("[data-search-paper-id]");
    if (!firstResult) return;
    event.preventDefault();
    firstResult.click();
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPaperSearch();
      return;
    }
    if (event.key === "/" && !isTyping && elements.paperSearchBackdrop.hidden) {
      event.preventDefault();
      openPaperSearch();
      return;
    }
    if (event.key === "Escape" && !elements.paperSearchBackdrop.hidden) {
      event.preventDefault();
      closePaperSearch();
    }
  });
  elements.navTabs.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab, { keepPaperContext: true }));
  });
  elements.languageOptions.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });
  elements.panelTabs.forEach((button) => {
    button.addEventListener("click", () => setPanel(button.dataset.panel));
  });
  elements.zoomOut.addEventListener("click", () => setZoom(state.tabs[state.activeTab].zoom - 0.1));
  elements.zoomIn.addEventListener("click", () => setZoom(state.tabs[state.activeTab].zoom + 0.1));
  elements.zoomReset.addEventListener("click", () => setZoom(DEFAULT_TREE_ZOOM));
  elements.canvasScroll.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(state.tabs[state.activeTab].zoom + (event.deltaY < 0 ? 0.1 : -0.1));
    },
    { passive: false },
  );
  elements.modelFamily.addEventListener("change", () => {
    state.modelFamily = elements.modelFamily.value;
    renderGraph();
  });
  elements.includeSecondaryFamily.addEventListener("change", () => {
    state.includeSecondaryFamily = elements.includeSecondaryFamily.checked;
    renderGraph();
  });
  elements.authorRoleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const role = input.dataset.authorRole;
      if (input.checked) state.authorRoles.add(role);
      else state.authorRoles.delete(role);
      if (!state.authorRoles.size) {
        state.authorRoles.add(role);
        input.checked = true;
        return;
      }
      state.tabs.authors.hasPositioned = false;
      renderGraph();
    });
  });

  let dragging = false;
  elements.splitter.addEventListener("pointerdown", (event) => {
    dragging = true;
    elements.splitter.setPointerCapture(event.pointerId);
    document.body.style.userSelect = "none";
  });
  elements.splitter.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const graphBounds = elements.graphView.getBoundingClientRect();
    const percentage = ((event.clientX - graphBounds.left) / graphBounds.width) * 100;
    const clamped = Math.min(78, Math.max(38, percentage));
    document.documentElement.style.setProperty("--left-width", `${clamped}%`);
  });
  elements.splitter.addEventListener("pointerup", (event) => {
    dragging = false;
    elements.splitter.releasePointerCapture(event.pointerId);
    document.body.style.userSelect = "";
  });
  elements.splitter.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const current = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--left-width")) || 75;
    const delta = event.key === "ArrowLeft" ? -2 : 2;
    document.documentElement.style.setProperty("--left-width", `${Math.min(78, Math.max(38, current + delta))}%`);
  });

  window.addEventListener("popstate", (event) => {
    applyHistorySnapshot(event.state);
    render();
  });
}

async function initialize() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status}).`);
    database = await response.json();
    indexes = makeIndexes(database);
    initializeSelections();
    applyInitialLocation();
    initializeModelFamilies();
    bindInteractions();
    elements.loading.hidden = true;
    replaceHistory();
    render();
  } catch (error) {
    console.error("Failed to initialize visualization", error);
    elements.loading.hidden = true;
    elements.error.hidden = false;
    elements.errorMessage.textContent = error instanceof Error ? error.message : String(error);
  }
}

initialize();
