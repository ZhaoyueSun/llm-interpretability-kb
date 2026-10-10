#!/usr/bin/env ruby

require "date"
require "pathname"
require "set"
require "yaml"

ROOT = Pathname.new(__dir__).parent.freeze
GRAPH_PATH = ROOT / "docs" / "research-question-graph-draft.yaml"
CORPUS_PATH = ROOT / "data" / "corpus.yaml"
PAPER_DIR = ROOT / "data" / "papers"
ALLOWED_EVIDENCE = %w[direct-citation same-lineage analyst-inference].freeze
REQUIRED_FAMILY_FIELDS = %w[
  family_id label_en label_zh guiding_question_en guiding_question_zh
  meaning_en meaning_zh evolution_en evolution_zh display_order
].freeze
REQUIRED_NODE_FIELDS = %w[
  rq_id family_id question_en question_zh introduction_en introduction_zh
  progress_en progress_zh first_date primary_paper_ids
].freeze

def counts(values)
  values.each_with_object(Hash.new(0)) { |value, result| result[value] += 1 }
end

errors = []
graph = YAML.load_file(GRAPH_PATH)
corpus = YAML.load_file(CORPUS_PATH)
papers = Dir.glob((PAPER_DIR / "*.yaml").to_s).to_h do |path|
  paper = YAML.load_file(path)
  [paper.fetch("paper_id"), paper]
end

nodes = graph.fetch("nodes")
node_ids = nodes.map { |node| node.fetch("rq_id") }
duplicate_node_ids = counts(node_ids).select { |_id, count| count > 1 }.keys
errors << "duplicate RQ node IDs: #{duplicate_node_ids.join(', ')}" unless duplicate_node_ids.empty?

family_records = graph.fetch("families")
family_ids = family_records.map { |family| family.fetch("family_id") }
duplicate_family_ids = counts(family_ids).select { |_id, count| count > 1 }.keys
errors << "duplicate family IDs: #{duplicate_family_ids.join(', ')}" unless duplicate_family_ids.empty?

family_records.each do |family|
  family_id = family.fetch("family_id")
  REQUIRED_FAMILY_FIELDS.each do |field|
    value = family[field]
    errors << "#{family_id}: missing or empty family field #{field}" if value.nil? || value.to_s.strip.empty?
  end
end

display_orders = family_records.map { |family| family.fetch("display_order") }
duplicate_display_orders = counts(display_orders).select { |_order, count| count > 1 }.keys
unless duplicate_display_orders.empty?
  errors << "duplicate family display orders: #{duplicate_display_orders.join(', ')}"
end

families = family_ids.to_set
nodes.each do |node|
  rq_id = node.fetch("rq_id")
  REQUIRED_NODE_FIELDS.each do |field|
    value = node[field]
    errors << "#{rq_id}: missing or empty node field #{field}" if value.nil? || value.to_s.strip.empty?
  end
  errors << "#{rq_id}: unknown family #{node.fetch('family_id')}" unless families.include?(node.fetch("family_id"))

  primary_ids = node.fetch("primary_paper_ids")
  errors << "#{rq_id}: has no primary papers" if primary_ids.empty?
  secondary_ids = node.fetch("secondary_paper_ids", [])
  unknown_ids = (primary_ids + secondary_ids).reject { |paper_id| papers.key?(paper_id) }
  errors << "#{rq_id}: unknown paper IDs #{unknown_ids.join(', ')}" unless unknown_ids.empty?
  overlap = primary_ids & secondary_ids
  errors << "#{rq_id}: papers cannot be both primary and secondary: #{overlap.join(', ')}" unless overlap.empty?
  next unless unknown_ids.empty?

  earliest_primary_date = primary_ids.map { |paper_id| papers.fetch(paper_id).fetch("earliest_public_date").to_s }.min
  if node.fetch("first_date").to_s != earliest_primary_date
    errors << "#{rq_id}: first_date #{node.fetch('first_date')} != earliest primary paper #{earliest_primary_date}"
  end
end

corpus_ids = corpus.fetch("papers").map { |paper| paper.fetch("paper_id") }.to_set
primary_assignments = nodes.flat_map do |node|
  node.fetch("primary_paper_ids").map { |paper_id| [paper_id, node.fetch("rq_id")] }
end
assignment_counts = counts(primary_assignments.map(&:first))
missing = corpus_ids.reject { |paper_id| assignment_counts.key?(paper_id) }.to_a.sort
extra = assignment_counts.keys.reject { |paper_id| corpus_ids.include?(paper_id) }.sort
multiple = assignment_counts.select { |_paper_id, count| count != 1 }
errors << "corpus papers without a primary RQ: #{missing.join(', ')}" unless missing.empty?
errors << "non-corpus papers assigned as primary: #{extra.join(', ')}" unless extra.empty?
errors << "papers with multiple primary RQs: #{multiple.keys.sort.join(', ')}" unless multiple.empty?

node_by_id = nodes.to_h { |node| [node.fetch("rq_id"), node] }
edge_keys = []
graph.fetch("edges").each do |edge|
  source = edge.fetch("source")
  target = edge.fetch("target")
  edge_key = [source, target]
  edge_keys << edge_key
  errors << "edge #{source} -> #{target}: unknown source" unless node_by_id.key?(source)
  errors << "edge #{source} -> #{target}: unknown target" unless node_by_id.key?(target)
  errors << "edge #{source} -> #{target}: self edge" if source == target
  unless ALLOWED_EVIDENCE.include?(edge.fetch("evidence_status"))
    errors << "edge #{source} -> #{target}: invalid evidence_status #{edge.fetch('evidence_status')}"
  end
  next unless node_by_id.key?(source) && node_by_id.key?(target)

  source_date = Date.parse(node_by_id.fetch(source).fetch("first_date").to_s)
  target_date = Date.parse(node_by_id.fetch(target).fetch("first_date").to_s)
  unless source_date < target_date
    errors << "edge #{source} -> #{target}: non-forward dates #{source_date} -> #{target_date}"
  end
end

duplicate_edges = counts(edge_keys).select { |_edge, count| count > 1 }.keys
errors << "duplicate edges: #{duplicate_edges.map { |source, target| "#{source} -> #{target}" }.join(', ')}" unless duplicate_edges.empty?

if errors.empty?
  evidence_counts = counts(graph.fetch("edges").map { |edge| edge.fetch("evidence_status") })
  puts "RQ graph valid: #{nodes.length} nodes, #{graph.fetch('edges').length} edges, #{corpus_ids.length} papers."
  puts "Edge evidence: #{ALLOWED_EVIDENCE.map { |level| "#{level}=#{evidence_counts.fetch(level, 0)}" }.join(', ')}."
else
  warn errors.map { |error| "ERROR: #{error}" }.join("\n")
  exit 1
end
