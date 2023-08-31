import {
  FunctionValue,
  RuntimeValue,
  VariableValue,
} from "../Interpreter/Value";
import { defineFunctions, defineVariables } from "./STD";

class Environment {
  constructor(public parent: Environment | null = null) {
    if (!parent) {
      defineVariables(this);
      defineFunctions(this);
    }
  }

  public variables: Map<string, RuntimeValue> = new Map();
  public constants: Map<string, string> = new Map();
  public functions: Map<string, RuntimeValue> = new Map();

  public delete(name: string): RuntimeValue {
    const identifier = this.get(name);

    if (this.functions.has(name)) {
      throw new Error("Can't delete function definition");
    }
    if (this.constants.has(name)) {
      throw new Error("Can't delete constant variable");
    }

    this.variables.delete(name);

    return identifier;
  }

  public get(name: string): RuntimeValue {
    if (this.variables.has(name)) {
      if (this.functions.has(name)) {
        return this.functions.get(name)!;
      }
      return this.variables.get(name)!;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Undefined variable ${name}`);
  }

  public set(name: string, value: RuntimeValue): VariableValue {
    const isConstant = this.constants.has(name);
    const isFunction = this.functions.has(name);
    const alreadyExist = this.variables.has(name);

    if (alreadyExist) {
      if (!isConstant && !isFunction) {
        this.variables.set(name, value);
        return new VariableValue(name, value);
      }

      throw new Error(`Cannot reassign ${name}`);
    }

    if (this.parent) {
      return this.parent.set(name, value);
    }

    throw new Error(`Undefined variable ${name}`);
  }

  public define(
    name: string,
    value: RuntimeValue,
    isConstant: boolean = false,
    isFunction: boolean = false
  ) {
    const isDefined = this.variables.has(name);

    if (isDefined) {
      throw new Error(`Cannot redefine ${name}`);
    }
    this.variables.set(name, value);

    if (isFunction) {
      this.functions.set(name, value);
      return this.functions.get(name)!;
    } else if (isConstant) {
      this.constants.set(name, name);
    }
    return this.variables.get(name)!;
  }

  destroy() {
    this.variables.clear();
    this.constants.clear();
    this.functions.clear();
  }
}

export default Environment;
