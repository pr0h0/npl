import fs, { read } from "fs";

import Lexer from "./Lexer/Lexer";
import Parser from "./Parser/Parser";
import { Program } from "./Parser/Stmt";
import readline from "readline";
import Interpreter from "./Interpreter/Interpreter";
import Environment from "./Environment/Environment";

function doFileReadParsing() {
  const sourceCode = fs.readFileSync("./sourceCode.npl", "utf-8");

  const lexer = new Lexer(sourceCode);

  const tokens = lexer.tokenize();

  // for (const token of tokens) {
  //   console.log(token);
  // }

  const parser = new Parser(tokens);
  const ast = parser.produceAST() as Program;
  const interpreter = new Interpreter(ast.body);

  try {
    interpreter.start();
  } catch (e) {
    console.error(e);
  }
}

function doCLIParsing() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

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
      console.log(interpreter.start());
    } catch (e) {
      console.error(e);
    }
    handleUserInput(rl, env);
  });
}
// doFileReadParsing();
doCLIParsing();
