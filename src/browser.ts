import { Expr } from "./Parser/Expr";
import Token from "./Lexer/Token";
import { Program } from "./Parser/Stmt";
import Parser from "./Parser/Parser";
import Lexer from "./Lexer/Lexer";
import Interpreter from "./Interpreter/Interpreter";
import Environment from "./Environment/Environment";

function appendToOutput(text: string) {
  const output = document.getElementById("output")!;
  output.innerHTML += text;
}

function doBrowserParsing() {
  const runButton = document.getElementById("run")!;
  const input = document.getElementById("input")! as HTMLTextAreaElement;

  const interpreter = new Interpreter([], new Environment());

  runButton.addEventListener("click", () => {
    const sourceCode = input.value;
    const lexer = new Lexer(sourceCode);

    let tokens: Token[] = [],
      ast: Expr | null = null;

    try {
      tokens = lexer.tokenize();
    } catch (e: any) {
      appendToOutput(e.message);
    }

    const parser = new Parser(tokens);

    try {
      ast = parser.produceAST() as Program;
    } catch (e: any) {
      appendToOutput(e.message);
    }

    try {
      for (const stmt of (ast as Program).body) {
        interpreter.interpret(stmt);
      }
    } catch (e: any) {
      appendToOutput(e.message);
    }
  });
}
