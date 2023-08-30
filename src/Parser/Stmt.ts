import Token from "../Lexer/Token";
import { Expr } from "./Expr";
import ExprType from "./ExprType";

export abstract class Stmt extends Expr {
  constructor(public type: ExprType) {
    super(ExprType.STMT);
  }
}

export class BlockStatement extends Stmt {
  constructor(public body: Expr[]) {
    super(ExprType.BLOCK_STATEMENT);
  }
}

export class VariableDeclaration extends Stmt {
  constructor(public name: Token, public value: Expr, public isConst: boolean) {
    super(ExprType.VARIABLE_DECLARATION);
  }
}

export class IfStatement extends Stmt {
  constructor(
    public condition: Expr,
    public thenStatement: Expr,
    public elseStatement: Expr | null
  ) {
    super(ExprType.IF_STATEMENT);
  }
}

export class WhileStatement extends Stmt {
  constructor(public condition: Expr, public body: Expr) {
    super(ExprType.WHILE_STATEMENT);
  }
}

export class ForStatement extends Stmt {
  constructor(
    public init: Expr,
    public condition: Expr,
    public update: Expr,
    public body: Expr
  ) {
    super(ExprType.FOR_STATEMENT);
  }
}

export class FunctionDeclaration extends Stmt {
  constructor(
    public name: Token,
    public params: Token[],
    public body: BlockStatement
  ) {
    super(ExprType.FUNCTION_DECLARATION);
  }
}

export class ReturnStatement extends Stmt {
  constructor(public argument: Expr) {
    super(ExprType.RETURN_STATEMENT);
  }
}

export class BreakStatement extends Stmt {
  constructor() {
    super(ExprType.BREAK_STATEMENT);
  }
}

export class ContinueStatement extends Stmt {
  constructor() {
    super(ExprType.CONTINUE_STATEMENT);
  }
}

export class ExpressionStatement extends Stmt {
  constructor(public expression: Expr) {
    super(ExprType.EXPRESSION_STATEMENT);
  }
}

export class EmptyStatement extends Stmt {
  constructor() {
    super(ExprType.EMPTY_STATEMENT);
  }
}

export class ThisExpression extends Stmt {
  constructor(public object: Expr) {
    super(ExprType.THIS_EXPRESSION);
  }
}

export class NewExpression extends Stmt {
  constructor(public callee: Expr, public args: Expr[]) {
    super(ExprType.NEW_EXPRESSION);
  }
}

export class ClassDeclaration extends Stmt {
  constructor(
    public name: Token,
    public superClass: Expr,
    public body: Expr[]
  ) {
    super(ExprType.CLASS_DECLARATION);
  }
}

export class Property extends Stmt {
  constructor(public key: Expr, public value: Expr) {
    super(ExprType.PROPERTY);
  }
}

export class ObjectExpr extends Expr {
  constructor(public properties: Property[]) {
    super(ExprType.OBJECT_EXPR);
  }
}

export class Program extends Expr {
  constructor(public body: Expr[]) {
    super(ExprType.PROGRAM);
  }
}
