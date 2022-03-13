const fs = require("fs/promises");
const express = require("express");

const app = express();
const port = 3000;

(async function runServer() {
  // The puzzle database is large, so we don't read it at boot time. Instead, when
  // we get a request, we'll randomly seek and read and parse the next full line.
  const puzzles = await fs.open("data/lichess_db_puzzle.csv");
  const { size: puzzlesSize } = await puzzles.stat();
  const HEADERS = [
    "PuzzleId",
    "FEN",
    "Moves",
    "Rating",
    "RatingDeviation",
    "Popularity",
    "NbPlays",
    "Themes",
    "GameUrl",
  ];

  app.get("/", async (req, res) => {
    const pos = Math.round(Math.random() * puzzlesSize);
    // Read a single page (16k) from a random offset. We can safely assume our
    // page will have a line in it.
    const { buffer } = await puzzles.read({ position: pos });
    // Read between the (new)lines
    const firstNl = buffer.indexOf("\n");
    const nextNl = buffer.indexOf("\n", firstNl + 1);
    const line = buffer.toString("utf-8", firstNl + 1, nextNl).split(",");
    const puzzle = {};
    HEADERS.forEach((h, i) => (puzzle[h] = line[i]));

    console.log({ pos, firstNl, nextNl, line, puzzle });

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Accept,If-Modified-Since,Cache-Control,X-Requested-With"
    );
    res.send(JSON.stringify(puzzle));
  });

  app.listen(port, () => {
    console.log(`Puzzle API listening on port ${port}`);
  });
})();
