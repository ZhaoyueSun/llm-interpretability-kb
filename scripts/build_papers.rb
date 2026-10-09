#!/usr/bin/env ruby

require "digest"
require "json"
require "pathname"
require "yaml"

ROOT = Pathname.new(__dir__).parent.freeze
DEFAULT_IMPORT = ROOT.join("imports/2026-10-08__llm-interpretability-final-corpus.json").freeze
PAPERS_DIR = ROOT.join("data/papers").freeze
AUTHORS_PATH = ROOT.join("data/authors.yaml").freeze

def require_field(object, key, context)
  value = object[key]
  abort("Missing #{key} in #{context}") if value.nil? || value == ""
  value
end

def author_id(name)
  normalized = begin
    name.unicode_normalize(:nfkd).encode("ASCII", undef: :replace, replace: "")
  rescue NoMethodError
    name.encode("ASCII", undef: :replace, replace: "")
  end
  slug = normalized.downcase.gsub(/[^a-z0-9]+/, "_").gsub(/^_+|_+$/, "")[0, 40]
  slug = "author" if slug.empty?
  digest = Digest::SHA1.hexdigest(name.downcase.strip)[0, 8]
  "a_#{slug}_#{digest}"
end

def author_roles(index, count)
  roles = []
  roles << "first" if index.zero?
  roles << "last" if index == count - 1
  roles << "middle" if roles.empty?
  roles
end

input_path = Pathname.new(ARGV[0] || DEFAULT_IMPORT).expand_path
abort("Import not found: #{input_path}") unless input_path.file?

manifest = JSON.parse(input_path.read(encoding: "UTF-8"))
handoff_id = input_path.basename(input_path.extname).to_s
papers = manifest.fetch("papers")

PAPERS_DIR.mkpath
existing_authors_document = AUTHORS_PATH.file? ? YAML.load_file(AUTHORS_PATH.to_s) : {}
authors = existing_authors_document.fetch("authors", {})
existing_author_ids = authors.keys
created = 0
skipped = 0

papers.each_with_index do |entry, source_index|
  paper_id = require_field(entry, "paper_id", "paper entry")
  metadata_path = Pathname.new(entry.dig("paths", "metadata"))
  metadata = JSON.parse(metadata_path.read(encoding: "UTF-8"))
  abort("Paper ID mismatch for #{paper_id}") unless metadata["paper_id"] == paper_id

  names = require_field(metadata, "authors", paper_id)
  paper_authors = names.each_with_index.map do |name, index|
    existing_match = authors.find do |_candidate_id, author|
      [author["canonical_name"], *Array(author["aliases"])].include?(name)
    end
    id = existing_match ? existing_match.first : author_id(name)
    authors[id] ||= {
      "canonical_name" => name,
      "aliases" => [],
      "external_ids" => {
        "orcid" => nil,
        "openalex" => nil,
        "semantic_scholar" => nil
      },
      "disambiguation_status" => "unreviewed"
    }
    {
      "author_id" => id,
      "name" => name,
      "position" => index + 1,
      "roles" => author_roles(index, names.length),
      "affiliations" => []
    }
  end

  output_path = PAPERS_DIR.join("#{paper_id}.yaml")
  if output_path.exist?
    skipped += 1
    next
  end

  paper = {
    "schema_version" => 1,
    "paper_id" => paper_id,
    "title" => require_field(metadata, "title", paper_id),
    "year" => require_field(metadata, "year", paper_id),
    "earliest_public_date" => require_field(entry, "earliest_public_date", paper_id),
    "earliest_public_date_precision" => require_field(entry, "earliest_public_date_precision", paper_id),
    "venue" => require_field(metadata, "venue", paper_id),
    "publication_type" => metadata["venue_type"],
    "identifiers" => {
      "doi" => metadata["doi"],
      "arxiv_id" => metadata["arxiv_id"],
      "openreview_id" => nil
    },
    "links" => {
      "primary" => metadata["source_url"],
      "pdf" => metadata["pdf_url"],
      "code" => nil
    },
    "authors" => paper_authors,
    "abstract" => {
      "source" => "PaperKnowledgeBase metadata, cross-checked against Docling full text",
      "source_url" => metadata["source_url"],
      "en" => require_field(metadata, "abstract", paper_id),
      "zh" => nil,
      "translation" => {
        "status" => "pending",
        "translated_by" => nil,
        "third_party_api_used" => false
      }
    },
    "knowledge_base" => {
      "record_id" => paper_id,
      "has_pdf" => metadata["has_pdf"] == true,
      "has_docling_fulltext" => metadata["has_fulltext"] == true
    },
    "provenance" => {
      "imported_from" => "PaperManage",
      "imported_at" => nil,
      "handoff_id" => handoff_id,
      "selection_source_index" => source_index,
      "abstract_verification" => "docling_token_coverage_at_least_0.95"
    }
  }

  output_path.write(YAML.dump(paper).gsub(/[ \t]+$/, ""), encoding: "UTF-8")
  created += 1
end

new_authors = authors.reject { |id, _author| existing_author_ids.include?(id) }
if AUTHORS_PATH.file?
  unless new_authors.empty?
    fragment = YAML.dump(new_authors.sort_by { |_id, author| author["canonical_name"].downcase }.to_h)
                   .sub(/\A---\s*\n/, "")
                   .lines
                   .map { |line| "  #{line}" }
                   .join
                   .gsub(/: \n/, ": null\n")
    AUTHORS_PATH.open("a", encoding: "UTF-8") { |file| file.write(fragment) }
  end
else
  authors_document = {
    "schema_version" => 1,
    "authors" => authors.sort_by { |_id, author| author["canonical_name"].downcase }.to_h
  }
  AUTHORS_PATH.write(YAML.dump(authors_document), encoding: "UTF-8")
end

puts("Created #{created} paper files; skipped #{skipped} existing files; added #{new_authors.length} author entities")
