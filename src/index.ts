import fs, { read } from "fs";
import readline from "readline-sync";

import Environment from "./Environment/Environment";
import Interpreter from "./Interpreter/Interpreter";
import Lexer from "./Lexer/Lexer";
import Parser from "./Parser/Parser";
import { Program } from "./Parser/Stmt";

function doFileReadParsing(fileName: string) {
  const sourceCode = fs.readFileSync(`./${fileName}`, "utf-8");

  const lexer = new Lexer(sourceCode);

  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.produceAST() as Program;
  const interpreter = new Interpreter(ast.body);

  interpreter.start(false);
}

function doCLIParsing() {
  console.log("Welcome to the NPL REPL!");

  const env = new Environment();

  handleUserInput(env);
}

function handleUserInput(env: Environment) {
  const answer = readline.question("> ");
  if (answer === "exit") {
    return;
  }
  try {
    const lexer = new Lexer(answer);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.produceAST();

    const interpreter = new Interpreter((ast as Program).body, env);
    interpreter.start();
  } catch (e) {
    console.error(e);
  }
  handleUserInput(env);
}

export { doFileReadParsing, doCLIParsing };
