import { Expr } from "./Expression";
import { Interpreter } from "./Interpreter";

export class UserDefinedFunction {
  constructor(
    private executeFn: (interpreter: Interpreter, args: Expr[]) => any
  ) {}

  call(interpreter: Interpreter, args: Expr[]): any {
    return this.executeFn(interpreter, args);
  }
}
