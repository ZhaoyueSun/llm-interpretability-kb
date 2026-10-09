#!/usr/bin/env ruby

require "json"
require "pathname"
require "yaml"

ROOT = Pathname.new(__dir__).parent.freeze
DEFAULT_IMPORT = ROOT.join("imports/2026-10-09__llm-interpretability-taxonomy-supplement.json").freeze
DEFAULT_CORPUS = ROOT.join("data/corpus.yaml").freeze

def require_field(object, key, context)
  value = object[key]
  abort("Missing #{key} in #{context}") if value.nil? || value == ""
  value
end

input_path = Pathname.new(ARGV[0] || DEFAULT_IMPORT).expand_path
corpus_path = Pathname.new(ARGV[1] || DEFAULT_CORPUS).expand_path

abort("Import not found: #{input_path}") unless input_path.file?
abort("Corpus not found: #{corpus_path}") unless corpus_path.file?

source = JSON.parse(input_path.read(encoding: "UTF-8"))
corpus = YAML.load_file(corpus_path.to_s)
handoff_id = input_path.basename(input_path.extname).to_s
papers = require_field(source, "papers", "import root")

abort("Expected corpus schema version 2") unless corpus["schema_version"] == 2
abort("papers must be an array") unless papers.is_a?(Array)
abort("Supplement count mismatch") unless papers.length == source["supplement_count"]

ids = papers.map { |paper| require_field(paper, "paper_id", "paper entry") }
duplicates = ids.group_by(&:itself).select { |_paper_id, values| values.length > 1 }
abort("Duplicate paper IDs in supplement: #{duplicates.keys.join(', ')}") unless duplicates.empty?

memberships = papers.map { |paper| paper["corpus_membership"] }.uniq
abort("Unsupported supplement memberships: #{memberships.inspect}") unless memberships == ["taxonomy-supplement"]

existing_ids = corpus.fetch("papers").map { |paper| paper["paper_id"] }
overlap = ids & existing_ids
if overlap.length == ids.length
  puts("Supplement #{handoff_id} is already present; no changes made")
  exit
end
abort("Partial overlap with corpus: #{overlap.join(', ')}") unless overlap.empty?

next_order = corpus.fetch("papers").count { |paper| paper["group"] == "supplement" }
new_entries = papers.each_with_index.map do |paper, source_index|
  next_order += 1
  {
    "paper_id" => paper["paper_id"],
    "group" => "supplement",
    "display_order" => next_order,
    "source_handoff_id" => handoff_id,
    "selection_rank_within_candidate_pool" => require_field(
      paper,
      "selection_rank_within_candidate_pool",
      paper["paper_id"]
    ),
    "inclusion_reason" => require_field(paper, "selection_rationale", paper["paper_id"]),
    "selection_source_index" => source_index
  }
end

corpus["version"] += 1
corpus["sources"] << {
  "project" => "PaperManage",
  "handoff_id" => handoff_id,
  "generated_on" => require_field(source, "generated_on", "import root"),
  "role" => "supplement"
}
corpus["scope"]["supplement"] = {
  "upstream_membership" => "taxonomy-supplement",
  "count" => next_order
}
corpus["papers"].concat(new_entries)

corpus_path.write(YAML.dump(corpus), encoding: "UTF-8")
puts("Merged #{new_entries.length} supplement papers into #{corpus_path}; total #{corpus['papers'].length}")
