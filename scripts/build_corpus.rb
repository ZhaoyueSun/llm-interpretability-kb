#!/usr/bin/env ruby

require "json"
require "pathname"
require "yaml"

ROOT = Pathname.new(__dir__).parent.freeze
DEFAULT_IMPORT = ROOT.join("imports/2026-10-08__llm-interpretability-final-corpus.json").freeze
DEFAULT_OUTPUT = ROOT.join("data/corpus.yaml").freeze

MEMBERSHIP_MAP = {
  "main-window" => "core",
  "foundation-candidate" => "classic"
}.freeze

def require_field(object, key, context)
  value = object[key]
  abort("Missing #{key} in #{context}") if value.nil? || value == ""
  value
end

input_path = Pathname.new(ARGV[0] || DEFAULT_IMPORT).expand_path
output_path = Pathname.new(ARGV[1] || DEFAULT_OUTPUT).expand_path
handoff_id = input_path.basename(input_path.extname).to_s

abort("Import not found: #{input_path}") unless input_path.file?

source = JSON.parse(input_path.read(encoding: "UTF-8"))
papers = require_field(source, "papers", "import root")
abort("papers must be an array") unless papers.is_a?(Array)

ids = papers.map { |paper| require_field(paper, "paper_id", "paper entry") }
id_counts = ids.each_with_object(Hash.new(0)) { |paper_id, counts| counts[paper_id] += 1 }
duplicates = id_counts.select { |_paper_id, count| count > 1 }
abort("Duplicate paper IDs: #{duplicates.keys.join(', ')}") unless duplicates.empty?

group_orders = Hash.new(0)
normalized_papers = papers.each_with_index.map do |paper, index|
  membership = require_field(paper, "corpus_membership", paper["paper_id"])
  group = MEMBERSHIP_MAP[membership]
  abort("Unsupported corpus membership #{membership.inspect}") unless group

  group_orders[group] += 1
  {
    "paper_id" => paper["paper_id"],
    "group" => group,
    "display_order" => group_orders[group],
    "selection_rank_within_candidate_pool" => require_field(
      paper,
      "selection_rank_within_candidate_pool",
      paper["paper_id"]
    ),
    "inclusion_reason" => require_field(paper, "selection_rationale", paper["paper_id"]),
    "selection_source_index" => index
  }
end

expected_core = source.dig("main_window", "count")
expected_classic = source["foundation_count"]
actual_core = group_orders["core"]
actual_classic = group_orders["classic"]

abort("Expected #{expected_core} core papers, found #{actual_core}") unless actual_core == expected_core
abort("Expected #{expected_classic} classic papers, found #{actual_classic}") unless actual_classic == expected_classic

corpus = {
  "schema_version" => 1,
  "corpus_id" => require_field(source, "corpus", "import root"),
  "version" => 1,
  "status" => "final",
  "source" => {
    "project" => "PaperManage",
    "handoff_id" => handoff_id,
    "generated_on" => require_field(source, "generated_on", "import root")
  },
  "scope" => {
    "core" => {
      "upstream_membership" => "main-window",
      "start" => source.dig("main_window", "start"),
      "end" => source.dig("main_window", "end"),
      "count" => actual_core
    },
    "classic" => {
      "upstream_membership" => "foundation-candidate",
      "count" => actual_classic
    }
  },
  "papers" => normalized_papers
}

output_path.dirname.mkpath
output_path.write(YAML.dump(corpus), encoding: "UTF-8")
puts("Wrote #{output_path} with #{actual_core} core and #{actual_classic} classic papers")
