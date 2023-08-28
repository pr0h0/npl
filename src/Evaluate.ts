import {
  BinaryExpr,
  BlockStmt,
  CallExpr,
  Expr,
  ExpressionStmt,
  ForStmt,
  FunctionStmt,
  IfStmt,
  LiteralExpr,
  Stmt,
  UnaryExpr,
  VarStmt,
  VariableExpr,
  WhileStmt,
} from "./Expression";
import TokenType from "./TokenType";

function evaluate(expr: Expr, environment: Record<string, any>): any {
  if (expr instanceof BinaryExpr) {
    const leftValue = evaluate(expr.left, environment);
    const rightValue = evaluate(expr.right, environment);

    switch (expr.operator.type) {
      case TokenType.PLUS:
        return leftValue + rightValue;
      case TokenType.MINUS:
        return leftValue - rightValue;
      // Handle other binary operators
      default:
        throw new Error(`Unsupported binary operator: ${expr.operator.lexeme}`);
    }
  } else if (expr instanceof UnaryExpr) {
    const rightValue = evaluate(expr.right, environment);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -rightValue;
      // Handle other unary operators
      default:
        throw new Error(`Unsupported unary operator: ${expr.operator.lexeme}`);
    }
  } else if (expr instanceof LiteralExpr) {
    return expr.value;
  } else if (expr instanceof VariableExpr) {
    if (expr.name.lexeme in environment) {
      return environment[expr.name.lexeme];
    } else {
      throw new Error(`Undefined variable: ${expr.name.lexeme}`);
    }
  } else if (expr instanceof CallExpr) {
    const callee = evaluate(expr.callee, environment);

    if (callee instanceof FunctionValue) {
      const args = expr.args.map((argument) => evaluate(argument, environment));
      return callee.call(args);
    } else {
      throw new Error("Attempting to call a non-function");
    }
  }

  throw new Error("Unknown expression type");
}

// Assuming you have a global environment to store variables and functions
const globalEnvironment: Record<string, any> = {};

function execute(stmt: Stmt, environment: Record<string, any>): void {
  if (stmt instanceof ExpressionStmt) {
    evaluate(stmt.expression, environment);
  } else if (stmt instanceof VarStmt) {
    const value = evaluate(stmt.initializer, environment);
    environment[stmt.name.lexeme] = value;
  } else if (stmt instanceof BlockStmt) {
    const newEnvironment = { ...environment };
    for (const statement of stmt.statements) {
      execute(statement, newEnvironment);
    }
  } else if (stmt instanceof IfStmt) {
    const conditionValue = evaluate(stmt.condition, environment);
    if (conditionValue) {
      execute(stmt.thenBranch, environment);
    } else if (stmt.elseBranch) {
      execute(stmt.elseBranch, environment);
    }
  } else if (stmt instanceof WhileStmt) {
    while (evaluate(stmt.condition, environment)) {
      execute(stmt.body, environment);
    }
  } else if (stmt instanceof ForStmt) {
    if (stmt.initializer) evaluate(stmt.initializer as Expr, environment);
    while (stmt.condition ? evaluate(stmt.condition, environment) : true) {
      execute(stmt.body, environment);
      if (stmt.increment) evaluate(stmt.increment, environment);
    }
  } else if (stmt instanceof FunctionStmt) {
    environment[stmt.name.lexeme] = new FunctionValue(stmt, environment);
  }
  // Handle other statement types
}

class FunctionValue {
  constructor(
    public declaration: FunctionStmt,
    public closure: Record<string, any>,
  ) {}

  call(args: any[]): any {
    const newEnvironment = { ...this.closure };
    for (let i = 0; i < this.declaration.parameters.length; i++) {
      newEnvironment[this.declaration.parameters[i].lexeme] = args[i];
    }
    execute(this.declaration.body, newEnvironment);
    // You might want to return a value if the function has a return statement
  }
}
