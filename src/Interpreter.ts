import { Environment } from "./Environment";
import { ExprType } from "./ExprType";
import {
  BinaryExpr,
  Expr,
  LiteralExpr,
  Stmt,
  UnaryExpr,
  VariableExpr,
} from "./Expression";
import { UserDefinedFunction } from "./STL";
import {
  AssignmentStatementStmt,
  FunctionCallStatementStmt,
  IfStatementStmt,
  VarDeclarationStmt,
  BlockStatementStmt,
  ExpressionStatementStmt,
  ForStatementStmt,
  FunctionStatementStmt,
  WhileStatementStmt,
} from "./Statements";
import { StmtType } from "./StmtType";
import TokenType from "./TokenType";
import { registerFunctions, registerVariables } from "./STL/index";

export class Interpreter {
  private environment: Environment = {};

  constructor() {
    this.registerStandardLibrary();
  }

  private registerStandardLibrary(): void {
    registerVariables(this.environment);
    registerFunctions(this.environment);
  }

  public evaluate(expr: Expr): any {
    switch (expr.type) {
      case ExprType.LITERAL:
        return (expr as LiteralExpr).value;

      case ExprType.VARIABLE:
        const variableName = (expr as VariableExpr).name.lexeme;
        if (variableName in this.environment) {
          return this.environment[variableName];
        }
        throw new Error(`Undefined variable: ${variableName}`);

      case ExprType.BINARY:
        const binaryExpr = expr as BinaryExpr;
        const left = this.evaluate(binaryExpr.left);
        const right = this.evaluate(binaryExpr.right);
        switch (binaryExpr.operator.type) {
          case TokenType.PLUS:
            return left + right;
          case TokenType.MINUS:
            return left - right;
          case TokenType.MULTIPLY:
            return left * right;
          case TokenType.DIVIDE:
            return left / right;
          case TokenType.MODULO:
            return left % right;
          case TokenType.EQUAL:
            return left === right;
          case TokenType.NOT_EQUAL:
            return left !== right;
          case TokenType.GREATER:
            return left > right;
          case TokenType.GREATER_EQUAL:
            return left >= right;
          case TokenType.LESS:
            return left < right;
          case TokenType.LESS_EQUAL:
            return left <= right;
          case TokenType.AND:
            return left && right;
          case TokenType.OR:
            return left || right;
          default:
            throw new Error(
              `Unsupported operator: ${binaryExpr.operator.lexeme}`,
            );
        }

      case ExprType.UNARY:
        const unaryExpr = expr as UnaryExpr;
        const operand = this.evaluate(unaryExpr.right);
        switch (unaryExpr.operator.type) {
          case TokenType.MINUS:
            return -operand;
          case TokenType.NOT:
            return !operand;
          default:
            throw new Error(
              `Unsupported operator: ${unaryExpr.operator.lexeme}`,
            );
        }

      // Add cases for other expression types here

      default:
        throw new Error(`Unsupported expression type: ${expr.type}`);
    }
  }

  private executeStatement(stmt: Stmt): void {
    switch (stmt.type) {
      case StmtType.VAR_DECLARATION:
        const varStmt = stmt as VarDeclarationStmt;
        this.environment[varStmt.name.lexeme] = varStmt.initializer
          ? this.evaluate(varStmt.initializer)
          : null;
        break;

      case StmtType.IF_STATEMENT:
        const ifStmt = stmt as IfStatementStmt;
        if (this.evaluate(ifStmt.condition)) {
          this.executeStatement(ifStmt.thenBranch);
        } else if (ifStmt.elseBranch) {
          this.executeStatement(ifStmt.elseBranch);
        }
        break;

      case StmtType.EXPRESSION_STATEMENT:
        const exprStmt = stmt as ExpressionStatementStmt;
        this.evaluate(exprStmt.expression);
        break;

      case StmtType.BLOCK_STATEMENT:
        const blockStmt = stmt as BlockStatementStmt;
        this.executeBlock(blockStmt.statements, this.environment);
        break;

      case StmtType.WHILE_STATEMENT:
        const whileStmt = stmt as WhileStatementStmt;
        while (this.evaluate(whileStmt.condition)) {
          this.executeStatement(whileStmt.body);
        }
        break;

      case StmtType.FUNCTION_STATEMENT:
        const funcStmt = stmt as FunctionStatementStmt;
        this.environment[funcStmt.name.lexeme] = new UserDefinedFunction(
          (interpreter: Interpreter, args: Expr[]) => {
            const funcEnvironment: Environment = {};
            // Create a new environment for the function, linked to the outer environment
            Object.setPrototypeOf(funcEnvironment, this.environment);

            // Bind arguments to parameter names in the function environment
            for (let i = 0; i < funcStmt.parameters.length; i++) {
              funcEnvironment[funcStmt.parameters[i].lexeme] =
                interpreter.evaluate(args[i]);
            }

            // Execute the function body within the new environment
            this.executeBlock(funcStmt.body, funcEnvironment);
          },
        );
        break;

      case StmtType.FOR_STATEMENT:
        const forStmt = stmt as ForStatementStmt;
        for (
          this.executeStatement(forStmt.init as Stmt);
          this.evaluate(forStmt.condition);
          this.evaluate(forStmt.increment)
        ) {
          this.executeStatement(forStmt.body);
        }
        break;

      case StmtType.ASSIGNMENT:
        const assignStmt = stmt as AssignmentStatementStmt;
        const value = this.evaluate(assignStmt.value);
        this.environment[assignStmt.name.lexeme] = value;
        break;

      case StmtType.FUNCTION_CALL:
        const funcCallStmt = stmt as FunctionCallStatementStmt;
        const funcName = funcCallStmt.name.lexeme;
        if (funcName in this.environment) {
          const func = this.environment[funcName];
          if (func instanceof UserDefinedFunction) {
            const args = funcCallStmt.args;
            func.call(this, args);
            return;
          }
        }
        throw new Error(`Undefined function: ${funcName}`);
      // Add more cases for other statement types here

      default:
        throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }

  private executeBlock(statements: Stmt[], environment: Environment): void {
    const previousEnvironment = this.environment;
    try {
      this.environment = environment;
      for (const statement of statements) {
        this.executeStatement(statement);
      }
    } finally {
      this.environment = previousEnvironment;
    }
  }

  public interpret(statements: Stmt[]): void {
    for (const statement of statements) {
      this.executeStatement(statement);
    }
  }
}
