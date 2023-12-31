import Environment from "../Environment/Environment";
import Token from "../Lexer/Token";
import { Expr } from "../Parser/Expr";
import ExprType from "../Parser/ExprType";
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

export class ArrayValue extends RuntimeValue {
  constructor(values: RuntimeValue[]) {
    super(values, ValueType.ARRAY);
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
    const interpreter = new Interpreter([], new Environment(this.closure));
    for (let i = 0; i < this.params.length; i++) {
      interpreter.environment.define(
        this.params[i].value,
        args[i] ?? new NullValue(),
        false,
        false
      );
    }
    let lastExpr: RuntimeValue = new NullValue();
    for (let i = 0; i < this.body.length; i++) {
      lastExpr = interpreter.interpret(this.body[i]);
      if (this.body[i].type === ExprType.RETURN_STATEMENT) {
        return lastExpr;
      }
    }

    return new NullValue();
  }
}

export class NativeFunctionValue extends RuntimeValue {
  constructor(public name: string, public func: Function) {
    super(null, ValueType.NATIVE_FUNCTION);
  }

  public call(args: RuntimeValue[]) {
    return this.func(args);
  }
}

export class VariableValue extends RuntimeValue {
  constructor(public name: string, public value: RuntimeValue) {
    super(value.value, ValueType.VARIABLE);
  }
}
