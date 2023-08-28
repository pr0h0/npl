import { Expr, Stmt } from "./Expression";
import { StmtType } from "./StmtType";
import Token from "./Token";

export class VarDeclarationStmt extends Stmt {
  constructor(
    public name: Token,
    public initializer: Expr | null,
  ) {
    super(StmtType.VAR_DECLARATION);
  }
}

export class IfStatementStmt extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt | null,
  ) {
    super(StmtType.IF_STATEMENT);
  }
}

export class ReturnStmt extends Stmt {
  constructor(public value: Expr | null) {
    super(StmtType.RETURN_STATEMENT);
  }
}

export class AssignmentStatementStmt extends Stmt {
  constructor(
    public name: Token,
    public value: Expr,
  ) {
    super(StmtType.ASSIGNMENT);
  }
}

export class FunctionCallStatementStmt extends Stmt {
  constructor(
    public name: Token,
    public args: Expr[],
  ) {
    super(StmtType.FUNCTION_CALL);
  }
}

export class FunctionDefinitionStmt extends Stmt {
  constructor(
    public name: Token,
    public args: Token[],
    public body: BlockStatementStmt,
  ) {
    super(StmtType.FUNCTION_STATEMENT);
  }
}

export class ForStatementStmt extends Stmt {
  constructor(
    public init: Stmt | null,
    public condition: Expr,
    public increment: Expr,
    public body: Stmt,
  ) {
    super(StmtType.FOR_STATEMENT);
  }
}

export class FunctionStatementStmt extends Stmt {
  constructor(
    public name: Token,
    public parameters: Token[],
    public body: Stmt[],
  ) {
    super(StmtType.FUNCTION_STATEMENT);
  }
}

export class WhileStatementStmt extends Stmt {
  constructor(
    public condition: Expr,
    public body: BlockStatementStmt,
  ) {
    super(StmtType.WHILE_STATEMENT);
  }
}

export class BlockStatementStmt extends Stmt {
  constructor(public statements: Stmt[]) {
    super(StmtType.BLOCK_STATEMENT);
  }
}

export class ExpressionStatementStmt extends Stmt {
  constructor(public expression: Expr) {
    super(StmtType.EXPRESSION_STATEMENT);
  }
}
