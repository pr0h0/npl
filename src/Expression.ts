import { ExprType } from "./ExprType";
import { StmtType } from "./StmtType";
import Token from "./Token";

export class Expr {
  constructor(public type: ExprType) {}
}

export class LiteralExpr extends Expr {
  constructor(public value: Token) {
    super(ExprType.LITERAL);
  }
}

export class VariableExpr extends Expr {
  constructor(public name: Token) {
    super(ExprType.VARIABLE);
  }
}

export class GroupingExpr extends Expr {
  constructor(public expression: Expr) {
    super(ExprType.GROUPING);
  }
}

export class BinaryExpr extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {
    super(ExprType.BINARY);
  }
}

export class UnaryExpr extends Expr {
  constructor(
    public operator: Token,
    public right: Expr,
  ) {
    super(ExprType.UNARY);
  }
}

export class CallExpr extends Expr {
  constructor(
    public callee: Expr,
    public args: Expr[],
  ) {
    super(ExprType.CALL);
  }
}

export abstract class Stmt {
  constructor(public type: StmtType) {}
}

export class ExpressionStmt extends Stmt {
  constructor(public expression: Expr) {
    super(StmtType.EXPRESSION_STATEMENT);
  }
}

export class VarStmt extends Stmt {
  constructor(
    public name: Token,
    public initializer: Expr,
  ) {
    super(StmtType.VAR_DECLARATION);
  }
}

export class BlockStmt extends Stmt {
  constructor(public statements: Stmt[]) {
    super(StmtType.BLOCK_STATEMENT);
  }
}

export class IfStmt extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt | null,
  ) {
    super(StmtType.IF_STATEMENT);
  }
}

export class WhileStmt extends Stmt {
  constructor(
    public condition: Expr,
    public body: Stmt,
  ) {
    super(StmtType.WHILE_STATEMENT);
  }
}

export class ForStmt extends Stmt {
  constructor(
    public initializer: Stmt | Expr | null,
    public condition: Expr | null,
    public increment: Expr | null,
    public body: Stmt,
  ) {
    super(StmtType.FOR_STATEMENT);
  }
}

export class FunctionStmt extends Stmt {
  constructor(
    public name: Token,
    public parameters: Token[],
    public body: Stmt,
  ) {
    super(StmtType.FUNCTION_STATEMENT);
  }
}
