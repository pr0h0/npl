import Environment from "../Environment/Environment";
import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import { AssignmentExpr, BinaryExpr, Expr, FunctionCallExpr, IdentifierExpr, NumberLiteralExpr, UnaryExpr } from "../Parser/Expr";
import ExprType from "../Parser/ExprType";
import { BlockStatement, ForStatement, FunctionDeclaration, IfStatement, VariableDeclaration, WhileStatement } from "../Parser/Stmt";
import { BooleanValue, FunctionValue, NullValue, NumberValue, RuntimeValue, StringValue, VariableValue } from "./Value";

class Interpreter {
  constructor(
    ast: Expr[],
    public environment: Environment = new Environment()
  ) {
    this.ast = ast;
  }

  public ast: Expr[] = [];

  public parseBinaryExpr(expr: Expr): RuntimeValue {
    const binary = expr as BinaryExpr;
    const left = this.interpret(binary.left);
    const right = this.interpret(binary.right);
    switch (binary.operator.value) {
      case "+":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (parseFloat(left.value) + parseFloat(right.value)).toString(),
            0
          )
        );
      case "-":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (parseFloat(left.value) - parseFloat(right.value)).toString(),
            0
          )
        );
      case "*":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (parseFloat(left.value) * parseFloat(right.value)).toString(),
            0
          )
        );
      case "/":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (parseFloat(left.value) / parseFloat(right.value)).toString(),
            0
          )
        );
      case "%":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (parseFloat(left.value) % parseFloat(right.value)).toString(),
            0
          )
        );
      case "==":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (left.value === right.value).toString(),
            0
          )
        );
      case "!=":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (left.value !== right.value).toString(),
            0
          )
        );
      case ">":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (parseFloat(left.value) > parseFloat(right.value)).toString(),
            0
          )
        );
      case ">=":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (parseFloat(left.value) >= parseFloat(right.value)).toString(),
            0
          )
        );
      case "<":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (parseFloat(left.value) < parseFloat(right.value)).toString(),
            0
          )
        );
      case "<=":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (parseFloat(left.value) <= parseFloat(right.value)).toString(),
            0
          )
        );
      case "&&":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (left.value && right.value).toString(),
            0
          )
        );
      case "||":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (left.value || right.value).toString(),
            0
          )
        );
      case "**":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            Math.pow(
              parseFloat(left.value),
              parseFloat(right.value)
            ).toString(),
            0
          )
        );
      default:
        throw new Error(
          `Unimplemented binary operator ${binary.operator.value}`
        );
    }
  }

  public parseAssignmentExpr(expr: AssignmentExpr): RuntimeValue {
    const assignment = expr as AssignmentExpr;
    const left = this.interpret(assignment.left) as VariableValue;
    const right = this.interpret(assignment.right);
    return this.environment.set(left.name, right.value);
  }

  public parseVariableDeclaration(expr: VariableDeclaration): RuntimeValue {
    const variable = expr as VariableDeclaration;
    return this.environment.define(
      variable.name.value,
      this.interpret(variable.value),
      variable.isConst
    );
  }

  public parseFunctionDeclaration(expr: FunctionDeclaration): RuntimeValue {
    const func = expr as FunctionDeclaration;
    return this.environment.define(
      func.name.value,
      new FunctionValue(
        func.name.value,
        func.params,
        func.body.body,
        this.environment
      ),
      false,
      true
    );
  }

  public parseFunctionCallExpr(expr: FunctionCallExpr): RuntimeValue {
    const func = this.environment.get(expr.name.value) as FunctionValue;
    const args = (expr as FunctionCallExpr).args.map((arg) => this.interpret(arg));
    return func.call(args);
  }

  public parseUnaryExpr(expr: UnaryExpr): RuntimeValue {
    const unary = expr as UnaryExpr;
    const right = this.interpret(unary.expr);
    switch (unary.operator.value) {
      case "--":
        return this.environment.set(
          (unary.expr as IdentifierExpr).name.value,
          new NumberValue(
            new Token(
              TokenType.NUMBER_LITERAL,
              (parseFloat(right.value) - 1).toString(),
              0
            )
          )
        );
      case "++":
        return this.environment.set(
          (unary.expr as IdentifierExpr).name.value,
          new NumberValue(
            new Token(
              TokenType.NUMBER_LITERAL,
              (parseFloat(right.value) + 1).toString(),
              0
            )
          )
        );
      case "!":
        return new BooleanValue(
          new Token(TokenType.BOOLEAN_LITERAL, (!right.value).toString(), 0)
        );
      default:
        throw new Error(`Unimplemented unary operator ${unary.operator.value}`);
    }
  }

  public parseIfStatement(expr: IfStatement): RuntimeValue {
    const ifStmt = expr as IfStatement;
    const condition = this.interpret(ifStmt.condition) as BooleanValue;
    if (condition.value) {
      return this.interpret(ifStmt.thenStatement);
    } else if (ifStmt.elseStatement) {
      return this.interpret(ifStmt.elseStatement);
    }
    return new NullValue();
  }

  public parseBlockStatement(expr: BlockStatement): RuntimeValue {
    const block = expr as BlockStatement;
    for (const stmt of block.body) {
      this.interpret(stmt);
    }
    return new NullValue();
  }

  public parseWhileStatement(expr: WhileStatement): RuntimeValue {
    const whileStmt = expr as WhileStatement;
    while (this.interpret(whileStmt.condition).value ==='true') {
      this.interpret(whileStmt.body);
    }
    return new NullValue();
  }

  public parseForStatement(expr: ForStatement): RuntimeValue {
    const forStmt = expr as ForStatement;
    this.interpret(forStmt.init);
    let counter = 0;
    while (this.interpret(forStmt.condition).value === 'true') {
      this.interpret(forStmt.body);
      this.interpret(forStmt.update);
      counter ++;
      if(counter > 100) break;
    }

    return new NullValue();
  }

  public interpret(expr: Expr): RuntimeValue {
    if (expr.type === ExprType.NUMBER_LITERAL) {
      return new NumberValue((expr as NumberLiteralExpr).value);
    }
    if (expr.type === ExprType.STRING_LITERAL) {
      return new StringValue((expr as NumberLiteralExpr).value);
    }
    if (expr.type === ExprType.NULL_LITERAL) {
      return new NullValue();
    }
    if (expr.type === ExprType.BOOLEAN_LITERAL) {
      return new BooleanValue((expr as NumberLiteralExpr).value);
    }

    if (expr.type === ExprType.VARIABLE_DECLARATION) {
      return this.parseVariableDeclaration(expr as VariableDeclaration);
    }
    if (expr.type === ExprType.IDENTIFIER) {
      return this.environment.get((expr as IdentifierExpr).name.value);
    }

    if (expr.type === ExprType.ASSIGNMENT_EXPR) {
      return this.parseAssignmentExpr(expr as AssignmentExpr);
    }

    if (expr.type === ExprType.UNARY_EXPR) {
      return this.parseUnaryExpr(expr as UnaryExpr);
    }

    if (expr.type === ExprType.BINARY_EXPR) {
      return this.parseBinaryExpr(expr as BinaryExpr);
    }

    if(expr.type === ExprType.IF_STATEMENT){
      return this.parseIfStatement(expr as IfStatement);
    }

    if(expr.type === ExprType.BLOCK_STATEMENT){
      return this.parseBlockStatement(expr as BlockStatement);
    }

    if (expr.type === ExprType.FUNCTION_DECLARATION) {
      return this.parseFunctionDeclaration(expr as FunctionDeclaration);
    }

    if (expr.type === ExprType.FUNCTION_CALL_EXPR) {
      return this.parseFunctionCallExpr(expr as FunctionCallExpr);
    }

    if(expr.type === ExprType.EMPTY_STATEMENT){
      return new NullValue();
    }

    if(expr.type === ExprType.EXPRESSION_STATEMENT){
      return this.interpret((expr as Expr)) as RuntimeValue;
    }

    if(expr.type === ExprType.WHILE_STATEMENT){
      return this.parseWhileStatement(expr as WhileStatement);
    }

    if(expr.type === ExprType.FOR_STATEMENT){
      return this.parseForStatement(expr as ForStatement);
    }

    throw new Error(`Unimplemented interpreter for ${expr.type}`);
  }

  public start() {
    for (const stmt of this.ast) {
      this.interpret(stmt);
    }
  }
}

export default Interpreter;
