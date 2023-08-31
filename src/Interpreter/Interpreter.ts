import Environment from "../Environment/Environment";
import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import {
  ArrayAccessExpr,
  ArrayLiteralExpr,
  AssignmentExpr,
  BinaryExpr,
  DeleteExpr,
  Expr,
  FunctionCallExpr,
  IdentifierExpr,
  NumberLiteralExpr,
  UnaryExpr,
} from "../Parser/Expr";
import ExprType from "../Parser/ExprType";
import {
  BlockStatement,
  ForStatement,
  FunctionDeclaration,
  IfStatement,
  ReturnStatement,
  VariableDeclaration,
  WhileStatement,
} from "../Parser/Stmt";
import {
  ArrayValue,
  BooleanValue,
  FunctionValue,
  NullValue,
  NumberValue,
  RuntimeValue,
  StringValue,
  VariableValue,
} from "./Value";
import ValueType from "./ValueType";

class Interpreter {
  constructor(
    ast: Expr[],
    public environment: Environment = new Environment()
  ) {
    this.ast = ast;
  }

  public ast: Expr[] = [];

  public parseAdditionExpr(
    left: RuntimeValue,
    right: RuntimeValue
  ): RuntimeValue {
    if (left.type === ValueType.STRING || right.type === ValueType.STRING) {
      return new StringValue(
        new Token(
          TokenType.STRING_LITERAL,
          left.value.toString() + right.value.toString(),
          0
        )
      );
    }

    if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          (parseFloat(left.value) + parseFloat(right.value)).toString(),
          0
        )
      );
    }

    if (left.type === ValueType.BOOLEAN && right.type === ValueType.BOOLEAN) {
      return new BooleanValue(
        new Token(
          TokenType.BOOLEAN_LITERAL,
          (left.value === "true" || right.value === "true").toString(),
          0
        )
      );
    }

    // if one of the values is null or some other literal, return the null value
    return new NullValue();
  }

  public parseSubstractionExpr(
    left: RuntimeValue,
    right: RuntimeValue
  ): RuntimeValue {
    if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          (parseFloat(left.value) - parseFloat(right.value)).toString(),
          0
        )
      );
    } else if (
      left.type === ValueType.STRING &&
      right.type === ValueType.STRING
    ) {
      return new StringValue(
        new Token(
          TokenType.STRING_LITERAL,
          left.value.toString().replace(right.value.toString(), ""),
          0
        )
      );
    } else if (
      left.type === ValueType.STRING &&
      right.type === ValueType.NUMBER
    ) {
      return new StringValue(
        new Token(
          TokenType.STRING_LITERAL,
          left.value.toString().slice(0, -parseFloat(right.value.toString())),
          0
        )
      );
    } else if (
      left.type === ValueType.NUMBER &&
      right.type === ValueType.STRING
    ) {
      return new StringValue(
        new Token(
          TokenType.STRING_LITERAL,
          right.value.slice(
            parseFloat(left.value.toString()),
            right.value.length
          ),
          0
        )
      );
    } else if (
      left.type === ValueType.BOOLEAN &&
      right.type === ValueType.BOOLEAN
    ) {
      return new BooleanValue(
        new Token(
          TokenType.BOOLEAN_LITERAL,
          (left.value && !right.value).toString(),
          0
        )
      );
    } else if (
      left.type === ValueType.BOOLEAN &&
      right.type === ValueType.NUMBER
    ) {
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          (
            parseFloat(left.value.toString()) -
            parseFloat(right.value.toString())
          ).toString(),
          0
        )
      );
    } else if (
      left.type === ValueType.NUMBER &&
      right.type === ValueType.BOOLEAN
    ) {
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          (
            parseFloat(left.value.toString()) -
            parseFloat(right.value.toString())
          ).toString(),
          0
        )
      );
    }

    return new NullValue();
  }

  public parseMultiplicationOperator(
    left: RuntimeValue,
    right: RuntimeValue
  ): RuntimeValue {
    if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          (parseFloat(left.value) * parseFloat(right.value)).toString(),
          0
        )
      );
    }
    if (left.type === ValueType.STRING && right.type === ValueType.NUMBER) {
      return new StringValue(
        new Token(
          TokenType.STRING_LITERAL,
          new Array(parseInt(right.value))
            .fill(0)
            .map((x) => left.value?.toString())
            .join(""),
          0
        )
      );
    }
    if (left.type === ValueType.STRING && right.type === ValueType.BOOLEAN) {
      return new StringValue(
        new Token(
          TokenType.STRING_LITERAL,
          right.value === "true" ? left.value : "",
          0
        )
      );
    }
    if (left.type === ValueType.NUMBER && right.type === ValueType.BOOLEAN) {
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          right.value === "true" ? left.value : "0",
          0
        )
      );
    }

    if (left.type === ValueType.BOOLEAN && right.type === ValueType.BOOLEAN) {
      return new BooleanValue(
        new Token(
          TokenType.BOOLEAN_LITERAL,
          (left.value === "true" && right.value === "true").toString(),
          0
        )
      );
    }

    return new NullValue();
  }

  public parseDivisionOperator(
    left: RuntimeValue,
    right: RuntimeValue
  ): RuntimeValue {
    if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
      if (parseFloat(right.value) === 0) {
        throw new Error("Zero division is not allowed");
      }
      return new NumberValue(
        new Token(
          TokenType.NUMBER_LITERAL,
          (parseFloat(left.value) / parseFloat(right.value)).toString(),
          0
        )
      );
    }

    if (left.type === ValueType.STRING && right.type === ValueType.NUMBER) {
      return new ArrayValue(
        new Array(
          Math.ceil(parseInt(left.value.length) / parseInt(right.value))
        )
          .fill(0)
          .map((_x, index) => {
            // if (index * 2 + 2 > left.value?.length) return new NullValue();
            const value = left.value?.toString();
            return new StringValue(
              new Token(
                TokenType.STRING_LITERAL,
                value?.slice(index * 2, index * 2 + 2),
                0
              )
            );
          })
          .filter((x) => x.type !== ValueType.NULL)
      );
    }

    // string / string to be left.split(right)
    if (left.type === ValueType.STRING && right.type === ValueType.STRING) {
      return new ArrayValue(
        left.value
          ?.toString()
          .split(right.value.toString())
          .filter((x: string) => x.length > 0)
          .map(
            (x: string) =>
              new StringValue(new Token(TokenType.STRING_LITERAL, x, 0))
          )
      );
    }

    return new NullValue();
  }

  public parseBinaryExpr(expr: Expr): RuntimeValue {
    const binary = expr as BinaryExpr;
    const left = this.interpret(binary.left);
    const right = this.interpret(binary.right);
    switch (binary.operator.value) {
      case "+":
        return this.parseAdditionExpr(left, right);
      case "-":
        return this.parseSubstractionExpr(left, right);
      case "*":
        return this.parseMultiplicationOperator(left, right);
      case "/":
        return this.parseDivisionOperator(left, right);
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
            (left.type === right.type && left.value === right.value).toString(),
            0
          )
        );
      case "!=":
        return new BooleanValue(
          new Token(
            TokenType.BOOLEAN_LITERAL,
            (left.value !== right.value || left.type !== right.type).toString(),
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
    const left = (assignment as AssignmentExpr).left as IdentifierExpr;
    const right = this.interpret(assignment.right);
    return this.environment.set(left.name.value, right);
  }

  public parseVariableDeclaration(expr: VariableDeclaration): RuntimeValue {
    const variable = expr as VariableDeclaration;
    return this.environment.define(
      variable.name.value,
      this.interpret(variable.value),
      variable.isConst
    );
  }

  public parseArrayLiteralExpr(expr: Expr): RuntimeValue {
    const array = expr as ArrayLiteralExpr;
    const value = array.elements.map((value) => this.interpret(value));
    return new ArrayValue(value);
  }

  public parseArrayAccessExpr(expr: ArrayAccessExpr): RuntimeValue {
    const array = expr as ArrayAccessExpr;
    const value = this.environment.get(array.name.value) as ArrayValue;
    const index = this.interpret(array.index) as NumberValue;
    return value.value[parseInt(index.value)] ?? new NullValue();
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
    const args = (expr as FunctionCallExpr).args.map((arg) =>
      this.interpret(arg)
    );
    return func.call(args);
  }

  public parseNotOperator(expr: RuntimeValue): boolean {
    if (expr.type === ValueType.BOOLEAN) {
      return !(expr.value === "true");
    }
    if (expr.type === ValueType.NULL) {
      return true;
    }
    if (expr.type === ValueType.NUMBER) {
      return parseFloat(expr.value) === 0;
    }
    if (expr.type === ValueType.STRING) {
      return expr.value.length === 0;
    }
    return false;
  }

  public parseDecrement(expr: UnaryExpr, value: RuntimeValue): RuntimeValue {
    if (value.type === ValueType.BOOLEAN) {
      return this.environment.set(
        (expr.expr as IdentifierExpr).name.value,
        new BooleanValue(
          new Token(TokenType.BOOLEAN_LITERAL, false.toString(), 0)
        )
      );
    }
    if (value.type === ValueType.NUMBER) {
      return this.environment.set(
        (expr.expr as IdentifierExpr).name.value,
        new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (parseFloat(value.value) - 1).toString(),
            0
          )
        )
      );
    } else if (value.type === ValueType.STRING) {
      return this.environment.set(
        (expr.expr as IdentifierExpr).name.value,
        new StringValue(
          new Token(
            TokenType.STRING_LITERAL,
            value.value.slice(0, -1).toString(),
            0
          )
        )
      );
    }

    return new NullValue();
  }

  public parseUnaryExpr(expr: UnaryExpr): RuntimeValue {
    const unary = expr as UnaryExpr;
    const right = this.interpret(unary.expr);
    switch (unary.operator.value) {
      case "--":
        return this.parseDecrement(unary, right);
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
          new Token(
            TokenType.BOOLEAN_LITERAL,
            this.parseNotOperator(right).toString(),
            0
          )
        );
      case "-":
        return new NumberValue(
          new Token(
            TokenType.NUMBER_LITERAL,
            (-parseFloat(right.value)).toString(),
            0
          )
        );
      default:
        throw new Error(`Unimplemented unary operator ${unary.operator.value}`);
    }
  }

  public parseIfStatement(expr: IfStatement): RuntimeValue {
    const ifStmt = expr as IfStatement;
    const condition = this.interpret(ifStmt.condition) as BooleanValue;
    const localEnvironment = new Environment(this.environment);
    const interpreter = new Interpreter([], localEnvironment);
    if (condition.value === "true") {
      interpreter.interpret(ifStmt.thenStatement);
    } else if (ifStmt.elseStatement) {
      interpreter.interpret(ifStmt.elseStatement);
    }
    return new NullValue();
  }

  public parseBlockStatement(expr: BlockStatement): RuntimeValue {
    const block = expr as BlockStatement;
    const localEnvironment = new Environment(this.environment);
    const interpreter = new Interpreter([], localEnvironment);
    for (const stmt of block.body) {
      interpreter.interpret(stmt);
    }
    localEnvironment.destroy();
    return new NullValue();
  }

  public parseWhileStatement(expr: WhileStatement): RuntimeValue {
    const whileStmt = expr as WhileStatement;
    const localEnvironment = new Environment(this.environment);
    const interpreter = new Interpreter([], localEnvironment);
    while (interpreter.interpret(whileStmt.condition).value === "true") {
      interpreter.interpret(whileStmt.body);
      localEnvironment.destroy();
    }
    return new NullValue();
  }

  public parseForStatement(expr: ForStatement): RuntimeValue {
    const forStmt = expr as ForStatement;
    const localEnvironment = new Environment(this.environment);
    const interpreter = new Interpreter([], localEnvironment);
    interpreter.interpret(forStmt.init);
    while (interpreter.interpret(forStmt.condition).value === "true") {
      interpreter.interpret(forStmt.body);
      interpreter.interpret(forStmt.update);
    }
    localEnvironment.destroy();

    return new NullValue();
  }

  public parseDeleteExpr(expr: DeleteExpr): RuntimeValue {
    return this.environment.delete(expr.name.value);
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

    if (expr.type === ExprType.IF_STATEMENT) {
      return this.parseIfStatement(expr as IfStatement);
    }

    if (expr.type === ExprType.BLOCK_STATEMENT) {
      return this.parseBlockStatement(expr as BlockStatement);
    }

    if (expr.type === ExprType.FUNCTION_DECLARATION) {
      return this.parseFunctionDeclaration(expr as FunctionDeclaration);
    }

    if (expr.type === ExprType.FUNCTION_CALL_EXPR) {
      return this.parseFunctionCallExpr(expr as FunctionCallExpr);
    }

    if (expr.type === ExprType.RETURN_STATEMENT) {
      return this.interpret((expr as ReturnStatement).argument);
    }

    if (expr.type === ExprType.EMPTY_STATEMENT) {
      return new NullValue();
    }

    if (expr.type === ExprType.EXPRESSION_STATEMENT) {
      return this.interpret(expr as Expr) as RuntimeValue;
    }

    if (expr.type === ExprType.WHILE_STATEMENT) {
      return this.parseWhileStatement(expr as WhileStatement);
    }

    if (expr.type === ExprType.FOR_STATEMENT) {
      return this.parseForStatement(expr as ForStatement);
    }

    if (expr.type === ExprType.DELETE) {
      return this.parseDeleteExpr(expr as DeleteExpr);
    }

    if (expr.type === ExprType.ARRAY_LITERAL_EXPR) {
      return this.parseArrayLiteralExpr(expr);
    }

    if (expr.type === ExprType.ARRAY_ACCESS_EXPR) {
      return this.parseArrayAccessExpr(expr as ArrayAccessExpr);
    }

    throw new Error(`Unimplemented interpreter for ${expr.type}`);
  }

  public start(showOutput = true) {
    for (const stmt of this.ast) {
      const value = this.interpret(stmt);
      if (showOutput && (value as RuntimeValue)?.value !== undefined) {
        console.log(value.value);
      }
    }
  }
}

export default Interpreter;
