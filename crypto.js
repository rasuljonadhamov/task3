const crypto = require("crypto");
const readline = require("readline");

class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }
}

class HMACCalculator {
  static calculateHMAC(key, message) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(message);
    return hmac.digest("hex");
  }
}

class GameRules {
  static determineWinner(playerMove, computerMove, moves) {
    const numMoves = moves.length;
    const halfMoves = Math.floor(numMoves / 2);
    const playerIndex = moves.indexOf(playerMove);
    const computerIndex = moves.indexOf(computerMove);

    if (playerMove === computerMove) {
      return "Draw";
    } else if (
      (computerIndex - playerIndex + numMoves) % numMoves <=
      halfMoves
    ) {
      return "You win!";
    } else {
      return "Computer wins";
    }
  }
}

class HelpTableGenerator {
  static generateHelpTable(moves) {
    const table = [["", ...moves]];
    for (let move of moves) {
      const row = [move];
      for (let i = 0; i < moves.length; i++) {
        if (i === moves.indexOf(move)) {
          row.push("Draw");
        } else if (
          (i - moves.indexOf(move) + moves.length) % moves.length <=
          Math.floor(moves.length / 2)
        ) {
          row.push("Win");
        } else {
          row.push("Lose");
        }
      }
      table.push(row);
    }
    return table;
  }
}

function printHelpTable(table) {
  for (let row of table) {
    console.log(row.join(" | "));
  }
}

function main() {
  const args = process.argv.slice(2);

  if (
    args.length < 3 ||
    new Set(args).size !== args.length ||
    args.length % 2 === 0
  ) {
    console.log(
      "Error: Please provide an odd number of at least 3 non-repeating moves as command line arguments."
    );
    console.log("Example: node crypto.js rock paper scissors");
    return;
  }

  const moves = args;
  const key = KeyGenerator.generateKey();
  const computerMove = moves[Math.floor(Math.random() * moves.length)];
  const hmac = HMACCalculator.calculateHMAC(key, computerMove);

  console.log("HMAC:", hmac);
  console.log("Available moves:");
  moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
  console.log("0 - exit");
  console.log("? - help");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter your move: ", (userInput) => {
    userInput = userInput.trim().toLowerCase();
    if (userInput === "0") {
      console.log("Thanks for playing!");
      rl.close();
    } else if (userInput === "?") {
      const helpTable = HelpTableGenerator.generateHelpTable(moves);
      printHelpTable(helpTable);
      rl.close();
    } else if (
      !/^\d+$/.test(userInput) ||
      parseInt(userInput) < 1 ||
      parseInt(userInput) > moves.length
    ) {
      console.log(
        "Invalid input. Please enter a number coresponding to the move or '?' for help."
      );
      main();
    } else {
      const userMove = moves[parseInt(userInput) - 1];
      console.log("Your move:", userMove);
      console.log("Computer move:", computerMove);
      const winner = GameRules.determineWinner(userMove, computerMove, moves);
      console.log(winner);
      console.log("HMAC key:", key);
      rl.close();
    }
  });
}

main();
