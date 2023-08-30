import {
  NativeFunctionValue,
  NumberValue,
  RuntimeValue,
  StringValue,
} from "../Interpreter/Value";
import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import Environment from "./Environment";

export function defineVariables(env: Environment) {
  env.define(
    "PI",
    new NumberValue(new Token(TokenType.NUMBER_LITERAL, Math.PI.toString(), 0))
  );
  env.define(
    "E",
    new NumberValue(new Token(TokenType.NUMBER_LITERAL, Math.E.toString(), 0))
  );
  env.define(
    "version",
    new StringValue(new Token(TokenType.STRING_LITERAL, "0.0.1", 0))
  );
}

export function defineFunctions(env: Environment) {
  env.define(
    "print",
    new NativeFunctionValue("print", (args: RuntimeValue[]) =>{
      args.forEach(arg => console.log(arg.value));
    }
    )
  );
}
