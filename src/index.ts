import fs, { read } from "fs";
import readline from "readline";

import Environment from "./Environment/Environment";
import Interpreter from "./Interpreter/Interpreter";
import Lexer from "./Lexer/Lexer";
import Parser from "./Parser/Parser";
import { Program } from "./Parser/Stmt";

function doFileReadParsing() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter file name to parse: ", (fileName) => {
  const sourceCode = fs.readFileSync(`./${fileName}`, "utf-8");

  const lexer = new Lexer(sourceCode);

  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.produceAST() as Program;
  const interpreter = new Interpreter(ast.body);

  interpreter.start();
});
}

function doCLIParsing() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Welcome to the NPL REPL!");

  const env = new Environment();

  handleUserInput(rl, env);
}

function handleUserInput(rl: readline.Interface, env: Environment) {
  rl.question("> ", (answer) => {
    if (answer === "exit") {
      rl.close();
      return;
    }
    try {
      const lexer = new Lexer(answer);
      const tokens = lexer.tokenize();
      for (const token of tokens) {
        console.log(token);
      }
      const parser = new Parser(tokens);
      const ast = parser.produceAST();
      for (const stmt of (ast as Program).body) {
        console.dir(stmt, { depth: null });
      }

      const interpreter = new Interpreter((ast as Program).body, env);
      interpreter.start();
    } catch (e) {
      console.error(e);
    }
    handleUserInput(rl, env);
  });
}

export { doFileReadParsing, doCLIParsing };
