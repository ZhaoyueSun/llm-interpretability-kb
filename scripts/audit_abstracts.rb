#!/usr/bin/env ruby

require "json"
require "pathname"

ROOT = Pathname.new(__dir__).parent.freeze
DEFAULT_IMPORT = ROOT.join("imports/2026-10-08__llm-interpretability-final-corpus.json").freeze

def normalize(text)
  text.to_s
      .downcase
      .gsub(/\s+/, " ")
      .tr("“”‘’", "''''")
      .strip
end

def tokens(text)
  normalize(text).scan(/[a-z0-9]+/)
end

input_path = Pathname.new(ARGV[0] || DEFAULT_IMPORT).expand_path
abort("Import not found: #{input_path}") unless input_path.file?

manifest = JSON.parse(input_path.read(encoding: "UTF-8"))
matches = []
misses = []
coverages = []

manifest.fetch("papers").each do |paper|
  metadata = JSON.parse(Pathname.new(paper.dig("paths", "metadata")).read(encoding: "UTF-8"))
  abstract = normalize(metadata["abstract"])
  fulltext = normalize(Pathname.new(paper.dig("paths", "fulltext_markdown")).read(encoding: "UTF-8"))
  abstract_tokens = tokens(abstract)
  fulltext_token_counts = tokens(fulltext).each_with_object(Hash.new(0)) do |token, counts|
    counts[token] += 1
  end
  matched_token_count = abstract_tokens.each_with_object(Hash.new(0)) do |token, counts|
    counts[token] += 1 if counts[token] < fulltext_token_counts[token]
  end.values.sum
  coverage = abstract_tokens.empty? ? 0.0 : matched_token_count.to_f / abstract_tokens.length
  coverages << coverage

  if !abstract.empty? && fulltext.include?(abstract)
    matches << paper["paper_id"]
  elsif coverage < 0.95
    misses << {
      "paper_id" => paper["paper_id"],
      "abstract_chars" => abstract.length,
      "token_coverage" => coverage.round(4)
    }
  end
end

sorted_coverages = coverages.sort

puts JSON.pretty_generate(
  "total" => manifest.fetch("papers").length,
  "normalized_exact_match" => matches.length,
  "token_coverage" => {
    "minimum" => sorted_coverages.first.round(4),
    "median" => sorted_coverages[sorted_coverages.length / 2].round(4),
    "maximum" => sorted_coverages.last.round(4),
    "threshold" => 0.95
  },
  "needs_review" => misses.length,
  "needs_review_papers" => misses
)
