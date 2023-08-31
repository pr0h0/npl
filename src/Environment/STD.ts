import {
  BooleanValue,
  NativeFunctionValue,
  NullValue,
  NumberValue,
  RuntimeValue,
  StringValue,
} from "../Interpreter/Value";
import ValueType from "../Interpreter/ValueType";
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
    "rand",
    new NativeFunctionValue("rand", (args: RuntimeValue[]) => {
      if(args.length && args[0].value === 'number') {
        return  new NumberValue(
          new Token(TokenType.NUMBER_LITERAL, Math.round(Math.random() * Date.now()).toString(), 0)
        )
      } else if(args.length && args[0].value === 'boolean') {
        return new BooleanValue(
          new Token(TokenType.BOOLEAN_LITERAL, (Math.random() - 0.5 > 0).toString(), 0 )
        );
      }

      return new StringValue(
        new Token(TokenType.STRING_LITERAL, Math.random().toString(16).slice(2), 0)
      );
    })
  );
  env.define(
    "print",
    new NativeFunctionValue("print", (args: RuntimeValue[]) => {
      args.forEach((arg) => console.log(arg.value));
      return new NullValue();
    })
  );
  env.define(
    "clear",
    new NativeFunctionValue("clear", (_args: RuntimeValue[]) => {
      console.clear();
      return new NullValue();
    })
  );
  env.define(
    "timestamp",
    new NativeFunctionValue("timestamp", (_args: RuntimeValue[]) => {
      return new NumberValue(
        new Token(TokenType.NUMBER_LITERAL, Date.now().toString(), 0)
      );
    })
  );
  env.define(
    "number",
    new NativeFunctionValue("number", (args: RuntimeValue[]) => {
      if(args.length === 0) throw new Error("Expected one argument");
      const number = Number(args[0].value);
      return new NumberValue(
        new Token(TokenType.NUMBER_LITERAL, number.toString() , 0)
      );
    })
  );
  env.define(
    "string",
    new NativeFunctionValue("string", (args: RuntimeValue[]) => {
      if(args.length === 0) throw new Error("Expected one argument");
      const value = String(args[0].value);
      return new StringValue(
        new Token(TokenType.STRING_LITERAL, value, 0)
      );
    })
  );

  env.define(
    "boolean",
    new NativeFunctionValue("boolean", (args: RuntimeValue[]) => {
      if(args.length === 0) throw new Error("Expected one argument");
      const value = args[0];
      let returnValue = 'false';

      if(value.type === ValueType.BOOLEAN) {
        returnValue = String(value.value === 'true');
      } else if(value.type === ValueType.NUMBER) {
        returnValue = Boolean(Number(value.value)).toString();
      } else if(value.type === ValueType.STRING) {
        returnValue = Boolean(value.value).toString();
      }

      return new StringValue(
        new Token(TokenType.BOOLEAN_LITERAL, returnValue, 0)
      );
    })
  );


}
