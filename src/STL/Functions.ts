import { Expr } from "../Expression";
import { Interpreter } from "../Interpreter";
import { UserDefinedFunction } from "../STL";

export const print = () => {
  return new UserDefinedFunction((interpreter: Interpreter, args: Expr[]) => {
    const values = [];
    for (const arg of args) {
      values.push(interpreter.evaluate(arg));
    }
    console.log(...values);
    return null;
  });
};
