const { doCLIParsing, doFileReadParsing } = require("./dist/index.js");

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Do you want to \n1. run the Interpreter\n2. read from a file?\n> ",
  (answer) => {
    if (answer === "1") {
      rl.close();
      doCLIParsing();
    } else if (answer === "2") {
      rl.close();
      doFileReadParsing();
    } else {
      console.log("Invalid input");
    }
  }
);
