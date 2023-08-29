import Environment from "../Environment/Environment";
import Token from "../Lexer/Token";
import { Expr } from "../Parser/Expr";
import { VariableDeclaration } from "../Parser/Stmt";
import Interpreter from "./Interpreter";
import ValueType from "./ValueType";

export abstract class RuntimeValue {
  constructor(public value: any, public type: ValueType) {}
}

export class NumberValue extends RuntimeValue {
  constructor(value: Token) {
    super(value.value, ValueType.NUMBER);
  }
}

export class StringValue extends RuntimeValue {
  constructor(value: Token) {
    super(value.value, ValueType.STRING);
  }
}

export class BooleanValue extends RuntimeValue {
  constructor(value: Token) {
    super(value.value, ValueType.BOOLEAN);
  }
}

export class NullValue extends RuntimeValue {
  constructor() {
    super(null, ValueType.NULL);
  }
}

export class FunctionValue extends RuntimeValue {
  constructor(
    public name: string,
    public params: Token[],
    public body: Expr[],
    public closure: Environment
  ) {
    super(null, ValueType.FUNCTION);
  }

  public call(args: RuntimeValue[]) {
    const interpreter = new Interpreter([], this.closure);
    for (let i = 0; i < this.params.length; i++) {
      interpreter.environment.define(
        this.params[i].value,
        args[i],
        false,
        false
      );
    }
    let lastExpr: RuntimeValue = new NullValue();
    for (let i = 0; i < this.body.length; i++) {
      console.log(this.body[i])
      lastExpr = interpreter.interpret(this.body[i]);
    }
    return lastExpr;
  }
}

export class NativeFunctionValue extends RuntimeValue {
  constructor(public name: string, public func: Function) {
    super(null, ValueType.NATIVE_FUNCTION);
  }

  public call(args: RuntimeValue[]) {
    console.log('native', {args})
    return this.func(args);
  }
}

export class VariableValue extends RuntimeValue {
  constructor(public name: string, public value: RuntimeValue) {
    super(value.value, ValueType.VARIABLE);
  }
}
