#!/usr/bin/env ruby

require "yaml"
require "pathname"

ROOT = Pathname.new(__dir__).parent.freeze
GRAPH_PATH = ROOT / "docs" / "research-question-graph-draft.yaml"
PAPER_DIR = ROOT / "data" / "papers"
DEFAULT_KB_ROOT = ROOT.parent / "PaperKnowledgeBase" / "papers" / "records"

STOPWORDS = %w[
  a an and are as at be by for from how in into is of on or the to towards using via
  with without
].freeze

def normalize(text)
  text.to_s.downcase.gsub(/[^a-z0-9]+/, " ").strip.gsub(/\s+/, " ")
end

def title_signature(title)
  tokens = normalize(title).split.reject { |token| STOPWORDS.include?(token) || token.length < 3 }
  tokens.first(8).join(" ")
end

def first_author_surname(paper)
  paper.fetch("authors").min_by { |author| author.fetch("position") }.fetch("name").split.last.downcase
end

def locate_fulltext(kb_root, paper_id)
  matches = Dir.glob((kb_root / "#{paper_id}__*" / "#{paper_id}.md").to_s)
  raise "missing full text for #{paper_id}" if matches.empty?
  raise "multiple full texts for #{paper_id}: #{matches.inspect}" if matches.length > 1

  Pathname.new(matches.first)
end


kb_root = Pathname.new(ARGV[0] || DEFAULT_KB_ROOT)
graph = YAML.load_file(GRAPH_PATH)
nodes = graph.fetch("nodes").to_h { |node| [node.fetch("rq_id"), node] }
papers = Dir.glob((PAPER_DIR / "*.yaml").to_s).to_h do |path|
  paper = YAML.load_file(path)
  [paper.fetch("paper_id"), paper]
end

puts "# Research Question Edge Citation Audit"
puts
puts "This report finds citation candidates in read-only Docling full text. A match proves"
puts "that a later paper likely cites an earlier paper; it does not by itself prove that the"
puts "citation supports the proposed RQ relationship."
puts

graph.fetch("edges").each do |edge|
  source_id = edge.fetch("source")
  target_id = edge.fetch("target")
  source_node = nodes.fetch(source_id)
  target_node = nodes.fetch(target_id)
  matches = []

  target_node.fetch("primary_paper_ids").each do |target_paper_id|
    target_paper = papers.fetch(target_paper_id)
    target_path = locate_fulltext(kb_root, target_paper_id)
    lines = target_path.readlines(encoding: "UTF-8")
    reference_start = lines.index do |line|
      line.match?(/^\#{1,4}\s*(references|bibliography|works cited)\b/i)
    end || lines.length
    windows = lines.each_index.map do |index|
      [
        index,
        index < reference_start ? "body" : "references",
        lines[index, 3].join(" "),
        normalize(lines[index, 3].join(" "))
      ]
    end

    source_node.fetch("primary_paper_ids").each do |source_paper_id|
      next if source_paper_id == target_paper_id

      source_paper = papers.fetch(source_paper_id)
      next unless source_paper.fetch("earliest_public_date").to_s < target_paper.fetch("earliest_public_date").to_s

      full_title = normalize(source_paper.fetch("title"))
      signature = title_signature(source_paper.fetch("title"))
      surname = first_author_surname(source_paper)
      year = source_paper.fetch("year").to_s

      title_match = lambda do |window|
        normalized_window = window[3]
        normalized_window.include?(full_title) ||
          (!signature.empty? && normalized_window.include?(signature))
      end
      author_year_match = lambda do |window|
        normalized_window = window[3]
        normalized_window.match?(/\b#{Regexp.escape(surname)}\b/) &&
          normalized_window.match?(/\b#{Regexp.escape(year)}[a-z]?\b/)
      end

      hit = windows.find { |window| window[1] == "body" && title_match.call(window) }
      match_type = "body-title"
      unless hit
        hit = windows.find { |window| window[1] == "body" && author_year_match.call(window) }
        match_type = "body-author-year"
      end
      unless hit
        hit = windows.find { |window| window[1] == "references" && title_match.call(window) }
        match_type = "references-title"
      end
      unless hit
        hit = windows.find { |window| window[1] == "references" && author_year_match.call(window) }
        match_type = "references-author-year"
      end

      next unless hit

      index, _section, raw_window, = hit
      matches << {
        source: source_paper_id,
        target: target_paper_id,
        match_type: match_type,
        path: target_path.relative_path_from(ROOT.parent).to_s,
        line: index + 1,
        excerpt: raw_window.gsub(/\s+/, " ").strip[0, 500]
      }
    end
  end

  puts "## #{source_id} → #{target_id}"
  puts
  puts "Proposed relation: `#{edge.fetch("type")}`"
  puts
  if matches.empty?
    puts "- No citation candidate found by title or first-author/year matching."
  else
    matches.each do |match|
      puts "- `#{match.fetch(:source)}` → `#{match.fetch(:target)}`: " \
        "#{match.fetch(:match_type)} match at `#{match.fetch(:path)}:#{match.fetch(:line)}`"
      puts "  > #{match.fetch(:excerpt)}"
    end
  end
  puts
end
