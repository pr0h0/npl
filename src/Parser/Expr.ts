import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import ExprType from "./ExprType";

export abstract class Expr {
  constructor(public type: ExprType) {}
}

export class NumberLiteralExpr extends Expr {
  constructor(public value: Token) {
    super(ExprType.NUMBER_LITERAL);
  }
}

export class StringLiteralExpr extends Expr {
  constructor(public value: Token) {
    super(ExprType.STRING_LITERAL);
  }
}

export class BooleanLiteralExpr extends Expr {
  constructor(public value: Token) {
    super(ExprType.BOOLEAN_LITERAL);
  }
}

export class NullLiteralExpr extends Expr {
  constructor() {
    super(ExprType.NULL_LITERAL);
  }
}

export class DeleteExpr extends Expr {
  constructor(public name: Token) {
    super(ExprType.DELETE);
  }
}

export class IdentifierExpr extends Expr {
  constructor(public name: Token) {
    super(ExprType.IDENTIFIER);
  }
}

export class AssignmentExpr extends Expr {
  constructor(public left: Expr, public right: Expr) {
    super(ExprType.ASSIGNMENT_EXPR);
  }
}

export class BinaryExpr extends Expr {
  constructor(public operator: Token, public left: Expr, public right: Expr) {
    super(ExprType.BINARY_EXPR);
  }
}

export class UnaryExpr extends Expr {
  constructor(public operator: Token, public expr: Expr) {
    super(ExprType.UNARY_EXPR);
  }
}

export class CallExpr extends Expr {
  constructor(public callee: Expr, public args: Expr[]) {
    super(ExprType.CALL_EXPR);
  }
}

export class MemberExpr extends Expr {
  constructor(public object: Expr, public property: Expr) {
    super(ExprType.MEMBER_EXPR);
  }
}

export class ArrayExpr extends Expr {
  constructor(public elements: Expr[]) {
    super(ExprType.ARRAY_EXPR);
  }
}

export class FunctionCallExpr extends Expr {
  constructor(public name: Token, public args: Expr[]) {
    super(ExprType.FUNCTION_CALL_EXPR);
  }
}

export class ArrayInitExpr extends Expr {
  constructor(public elements: Expr[]) {
    super(ExprType.ARRAY_INIT_EXPR);
  }
}

export class ArrayLiteralExpr extends Expr {
  constructor(public elements: Expr[]) {
    super(ExprType.ARRAY_LITERAL_EXPR);
  }
}