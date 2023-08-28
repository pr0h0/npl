import { Stmt } from "./Expression";
import { Interpreter } from "./Interpreter";
import Lexer from "./Lexer";
import { Parser } from "./Parser";
import Token from "./Token";
import * as fs from "fs";

const sourceCode = fs.readFileSync("./sourceCodeExample.npl", {
  encoding: "utf-8",
});

const lexer = new Lexer(sourceCode);
const tokens: Token[] = lexer.scanTokens();
const parser = new Parser(tokens);
const statements: Stmt[] = parser.parse();
const interpreter = new Interpreter();
interpreter.interpret(statements);
