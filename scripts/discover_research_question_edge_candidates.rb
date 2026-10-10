#!/usr/bin/env ruby

require "pathname"
require "yaml"

ROOT = Pathname.new(__dir__).parent.freeze
GRAPH_PATH = ROOT / "docs" / "research-question-graph-draft.yaml"
PAPER_DIR = ROOT / "data" / "papers"
DEFAULT_KB_ROOT = ROOT.parent / "PaperKnowledgeBase" / "papers" / "records"
STOPWORDS = %w[a an and are as at be by for from how in into is of on or the to towards using via with without].freeze

def normalize(text)
  text.to_s.downcase.gsub(/[^a-z0-9]+/, " ").strip.gsub(/\s+/, " ")
end

def title_signature(title)
  normalize(title).split.reject { |token| STOPWORDS.include?(token) || token.length < 3 }.first(8).join(" ")
end

def first_author_surname(paper)
  paper.fetch("authors").min_by { |author| author.fetch("position") }.fetch("name").split.last.downcase
end

def locate_fulltext(kb_root, paper_id)
  matches = Dir.glob((kb_root / "#{paper_id}__*" / "#{paper_id}.md").to_s)
  raise "missing full text for #{paper_id}" if matches.empty?
  raise "multiple full texts for #{paper_id}" if matches.length > 1

  Pathname.new(matches.first)
end

kb_root = Pathname.new(ARGV[0] || DEFAULT_KB_ROOT)
graph = YAML.load_file(GRAPH_PATH)
papers = Dir.glob((PAPER_DIR / "*.yaml").to_s).to_h do |path|
  paper = YAML.load_file(path)
  [paper.fetch("paper_id"), paper]
end
paper_to_node = graph.fetch("nodes").each_with_object({}) do |node, result|
  node.fetch("primary_paper_ids").each { |paper_id| result[paper_id] = node.fetch("rq_id") }
end
existing_edges = graph.fetch("edges").each_with_object({}) do |edge, result|
  result[[edge.fetch("source"), edge.fetch("target")]] = true
end

matches = Hash.new { |hash, key| hash[key] = [] }
paper_to_node.each_key do |target_paper_id|
  target_paper = papers.fetch(target_paper_id)
  lines = locate_fulltext(kb_root, target_paper_id).readlines(encoding: "UTF-8")
  reference_start = lines.index { |line| line.match?(/^\#{1,4}\s*(references|bibliography|works cited)\b/i) } || lines.length
  body_lines = lines[0...reference_start]
  body = normalize(body_lines.join(" "))
  windows = body_lines.each_index.map { |index| normalize(body_lines[index, 3].join(" ")) }

  paper_to_node.each_key do |source_paper_id|
    next if source_paper_id == target_paper_id

    source_paper = papers.fetch(source_paper_id)
    next unless source_paper.fetch("earliest_public_date").to_s < target_paper.fetch("earliest_public_date").to_s

    source_node = paper_to_node.fetch(source_paper_id)
    target_node = paper_to_node.fetch(target_paper_id)
    next if source_node == target_node || existing_edges[[source_node, target_node]]

    full_title = normalize(source_paper.fetch("title"))
    signature = title_signature(source_paper.fetch("title"))
    surname = first_author_surname(source_paper)
    year = source_paper.fetch("year").to_s
    title_hit = body.include?(full_title) || (!signature.empty? && body.include?(signature))
    author_year_hit = surname.length >= 5 && windows.any? do |window|
      window.match?(/\b#{Regexp.escape(surname)}\b/) && window.match?(/\b#{Regexp.escape(year)}[a-z]?\b/)
    end
    next unless title_hit || author_year_hit

    key = [source_node, target_node]
    matches[key] << [source_paper_id, target_paper_id, title_hit ? "title" : "author-year"]
  end
end

puts "# Unreviewed RQ Edge Candidates"
puts
puts "Candidates are absent from the current graph and ranked by the number of corpus-paper"
puts "pairs with main-text citation matches. They require manual context review."
puts
matches.sort_by { |(_source, _target), pairs| [-pairs.length, _source, _target] }.each do |(source, target), pairs|
  puts "## #{source} → #{target} (#{pairs.length})"
  puts
  pairs.uniq.each do |source_paper_id, target_paper_id, match_type|
    puts "- `#{source_paper_id}` → `#{target_paper_id}` (#{match_type})"
  end
  puts
end
