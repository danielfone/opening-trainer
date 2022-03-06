#
# A very simple server to return a random puzzle from the lichess puzzle database
#

require "rack"
require "csv"
require "json"

# The puzzle database is large, so we don't read it at boot time. Instead, when
# we get a request, we'll randomly seek and read and parse the next full line.
PUZZLES = File.new("data/lichess_db_puzzle.csv")
HEADERS = %w(PuzzleId FEN Moves Rating RatingDeviation Popularity NbPlays Themes GameUrl)

run lambda { |env|
  # Seek to a random offset. NB, this means we don't truly have an equal chance at getting each puzzle.
  PUZZLES.seek(rand * PUZZLES.size)
  # Since we're probably in the middle of a line, read (and ignore) the current half-line.
  PUZZLES.readline
  # Read a full line
  line = PUZZLES.readline.chomp
  puzzle = HEADERS.zip(line.split(",")).to_h
  [
    200,
    {
      'Content-Type' => 'application/json'
    },
    [puzzle.to_json]
  ]
}
