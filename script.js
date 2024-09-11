const crypto = require("crypto");

class GameRules {
  constructor(moves) {
    this.moves = moves;
    this.numMoves = moves.length;
  }

  determineWinner(move1, move2) {
    if (move1 === move2) return "Draw";
    const half = Math.floor(this.numMoves / 2);
    const index1 = this.moves.indexOf(move1);
    const index2 = this.moves.indexOf(move2);
    if (
      (index2 > index1 && index2 - index1 <= half) ||
      (index1 > index2 && index1 - index2 > half)
    ) {
      return "Win";
    }
    return "Lose";
  }
}

class TableGenerator {
  generateTable(moves) {
    const rules = new GameRules(moves);
    let table = "| vs       | " + moves.join(" | ") + " |\n";
    table += "|" + "-".repeat(10 + moves.length * 11) + "|\n";

    for (let move1 of moves) {
      table += `| ${move1.padEnd(8)} |`;
      for (let move2 of moves) {
        table += ` ${rules.determineWinner(move1, move2).padEnd(8)} |`;
      }
      table += "\n";
    }
    return table;
  }
}

class CryptoHelper {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static calculateHMAC(message, key) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(message);
    return hmac.digest("hex");
  }
}

class Game {
  constructor(moves) {
    this.rules = new GameRules(moves);
    this.moves = moves;
  }

  play() {
    const key = CryptoHelper.generateKey();
    const computerMove =
      this.moves[Math.floor(Math.random() * this.moves.length)];
    const hmac = CryptoHelper.calculateHMAC(computerMove, key);

    console.log(`HMAC: ${hmac}`);

    while (true) {
      console.log("Available moves:");
      this.moves.forEach((move, index) =>
        console.log(`${index + 1} - ${move}`)
      );
      console.log("0 - Exit");
      console.log("? - Help");

      const userInput = require("readline-sync")
        .question("Enter your move: ")
        .trim()
        .toLowerCase();

      if (userInput === "0") {
        console.log("Thanks for playing!");
        break;
      } else if (userInput === "?") {
        console.log(new TableGenerator().generateTable(this.moves));
        continue;
      }

      const userMoveIndex = parseInt(userInput) - 1;
      if (
        isNaN(userMoveIndex) ||
        userMoveIndex < 0 ||
        userMoveIndex >= this.moves.length
      ) {
        console.log("Invalid input. Please try again.");
        continue;
      }

      const userMove = this.moves[userMoveIndex];
      console.log(`Your move: ${userMove}`);
      console.log(`Computer move: ${computerMove}`);

      const result = this.rules.determineWinner(userMove, computerMove);
      console.log(`You ${result}!`);
      console.log(`HMAC key: ${key}`);
      break;
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3 || args.length % 2 === 0) {
    console.error("Error: Please provide an odd number of moves (3 or more).");
    console.error("Example: node script.js Rock Paper Scissors");
    process.exit(1);
  }

  if (new Set(args).size !== args.length) {
    console.error("Error: All moves must be unique.");
    console.error("Example: node script.js Rock Paper Scissors Lizard Spock");
    process.exit(1);
  }

  const game = new Game(args);
  game.play();
}

main();
