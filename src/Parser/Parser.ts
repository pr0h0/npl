import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import {
  AssignmentExpr,
  BinaryExpr,
  BooleanLiteralExpr,
  DeleteExpr,
  Expr,
  FunctionCallExpr,
  IdentifierExpr,
  NullLiteralExpr,
  NumberLiteralExpr,
  StringLiteralExpr,
  UnaryExpr,
} from "./Expr";
import {
  BlockStatement,
  EmptyStatement,
  ForStatement,
  FunctionDeclaration,
  IfStatement,
  Program,
  ReturnStatement,
  VariableDeclaration as VariableDeclarationStmt,
  WhileStatement,
} from "./Stmt";

class Parser {
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  public tokens: Token[] = [];
  public peek(index = 0): Token {
    return this.tokens[index];
  }
  public advance(): Token {
    return this.tokens.shift()!;
  }
  public consume(type: TokenType): Token {
    if (this.peek().type === type) {
      return this.advance();
    }
    console.error("Expected", type, "but got", this.peek());
    throw new Error("Unexpected token");
  }
  public isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }
  public parseNumberLiteral(): NumberLiteralExpr {
    return new NumberLiteralExpr(this.consume(TokenType.NUMBER_LITERAL));
  }
  public parseStringLiteral(): StringLiteralExpr {
    return new StringLiteralExpr(this.consume(TokenType.STRING_LITERAL));
  }
  public parseNullLiteral(): NullLiteralExpr {
    this.consume(TokenType.IDENTIFIER);
    return new NullLiteralExpr();
  }
  public parseDeleteExpr(): DeleteExpr {
    this.consume(TokenType.DELETE);
    const identifier = this.consume(TokenType.IDENTIFIER);
    this.consume(TokenType.SEMICOLON);
    return new DeleteExpr(identifier);
  }

  public parseIdentifierExpr(): Expr {
    if (this.peek().value === TokenType.NULL.toLowerCase()) {
      return this.parseNullLiteral();
    }
    if (
      this.peek().value === TokenType.VAR.toLowerCase() ||
      this.peek().value === TokenType.CONST.toLowerCase()
    ) {
      const type = this.consume(this.peek().type);
      const name = this.consume(TokenType.IDENTIFIER);
      if (this.peek().type === TokenType.ASSIGN) {
        this.consume(TokenType.ASSIGN);
        const value = this.parseExpr();
        this.consume(TokenType.SEMICOLON);
        return new VariableDeclarationStmt(name, value, type.value === "const");
      } else if (
        this.peek().type === TokenType.SEMICOLON &&
        type.value === "const"
      ) {
        throw new Error("const variables must be initialized");
      }
      this.consume(TokenType.SEMICOLON);
      return new VariableDeclarationStmt(
        name,
        new EmptyStatement(),
        type.value === "const"
      );
    }
    if (this.peek().value === TokenType.WHILE.toLowerCase()) {
      this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.OPEN_PAREN);
      const condition = this.parseExpr();
      this.consume(TokenType.CLOSE_PAREN);
      const body = this.parseBlockStatement();
      return new WhileStatement(condition, body);
    }
    if (this.peek().value === TokenType.FOR.toLowerCase()) {
      this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.OPEN_PAREN);
      const start = this.parseExpr();
      const condition = this.parseExpr();
      this.consume(TokenType.SEMICOLON);
      const increment = this.parseExpr();
      this.consume(TokenType.CLOSE_PAREN);
      const body = this.parseBlockStatement();
      return new ForStatement(start, condition, increment, body);
    }
    if (this.peek().value === TokenType.FUNCTION.toLowerCase()) {
      this.consume(TokenType.IDENTIFIER);
      const name = this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.OPEN_PAREN);
      const params: Token[] = [];
      while (this.peek().type !== TokenType.CLOSE_PAREN) {
        params.push(this.consume(TokenType.IDENTIFIER));
        if (this.peek().type === TokenType.COMMA) {
          this.consume(TokenType.COMMA);
        }
      }
      this.consume(TokenType.CLOSE_PAREN);
      const body = this.parseBlockStatement();
      return new FunctionDeclaration(name, params, body);
    }
    if (this.peek().value === TokenType.IF.toLowerCase()) {
      this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.OPEN_PAREN);
      const condition = this.parseExpr();
      this.consume(TokenType.CLOSE_PAREN);
      const body = this.parseBlockStatement();
      let elseBody: BlockStatement | null = null;
      if (this.peek().value === TokenType.ELSE.toLowerCase()) {
        this.consume(TokenType.IDENTIFIER);
        elseBody = this.parseBlockStatement();
      }
      return new IfStatement(condition, body, elseBody);
    }
    if (this.peek(1).type === TokenType.OPEN_PAREN) {
      const name = this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.OPEN_PAREN);
      const args: Expr[] = [];
      while (this.peek().type !== TokenType.CLOSE_PAREN) {
        args.push(this.parseExpr());
        if (this.peek().type === TokenType.COMMA) {
          this.consume(TokenType.COMMA);
        }
      }
      this.consume(TokenType.CLOSE_PAREN);
      if (this.peek().type === TokenType.SEMICOLON) {
        this.consume(TokenType.SEMICOLON);
      }
      return new FunctionCallExpr(name, args);
    }

    if (this.peek().value === TokenType.RETURN.toLowerCase()) {
      this.consume(TokenType.IDENTIFIER);
      const value = this.parseExpr();
      this.consume(TokenType.SEMICOLON);
      return new ReturnStatement(value);
    }

    if (
      this.peek().value === TokenType.TRUE.toLowerCase() ||
      this.peek().value === TokenType.FALSE.toLowerCase()
    ) {
      return new BooleanLiteralExpr(this.consume(this.peek().type));
    }

    if (this.peek(1).type === TokenType.SEMICOLON) {
      const name = this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.SEMICOLON);
      return new IdentifierExpr(name);
    }

    return new IdentifierExpr(this.consume(TokenType.IDENTIFIER));
  }
  public parseBlockStatement(): BlockStatement {
    const body: Expr[] = [];
    this.consume(TokenType.OPEN_BRACE);
    while (this.peek().type !== TokenType.CLOSE_BRACE) {
      body.push(this.parseExpr());
    }
    this.consume(TokenType.CLOSE_BRACE);
    return new BlockStatement(body);
  }
  public parseExpr(): Expr {
    return this.parseAssignmentExpr();
  }
  public parseAssignmentExpr(): Expr {
    const expr = this.parseLogicalExpr();
    if (this.peek().type === TokenType.ASSIGN) {
      this.consume(TokenType.ASSIGN);
      const value = this.parseLogicalExpr();
      this.consume(TokenType.SEMICOLON);
      return new AssignmentExpr(expr, value);
    }
    return expr;
  }
  public parseLogicalExpr(): Expr {
    let expr = this.parseEqualityAndComparisonExpr();
    while (
      this.peek().type === TokenType.AND ||
      this.peek().type === TokenType.OR
    ) {
      const operator = this.consume(this.peek().type);
      const right = this.parseEqualityAndComparisonExpr();
      expr = new BinaryExpr(operator, expr, right);
    }
    return expr;
  }
  public parseEqualityAndComparisonExpr(): Expr {
    let expr = this.parseAdditionExpr();
    while (
      this.peek().type === TokenType.EQUAL ||
      this.peek().type === TokenType.NOT_EQUAL ||
      this.peek().type === TokenType.GREATER ||
      this.peek().type === TokenType.GREATER_EQUAL ||
      this.peek().type === TokenType.LESS ||
      this.peek().type === TokenType.LESS_EQUAL
    ) {
      const operator = this.consume(this.peek().type);
      const right = this.parseAdditionExpr();
      expr = new BinaryExpr(operator, expr, right);
    }
    return expr;
  }
  public parseAdditionExpr(): Expr {
    let expr = this.parseMultiplicationExpr();
    while (
      this.peek().type === TokenType.PLUS ||
      this.peek().type === TokenType.MINUS
    ) {
      const operator = this.consume(this.peek().type);
      const right = this.parseMultiplicationExpr();
      expr = new BinaryExpr(operator, expr, right);
    }
    return expr;
  }

  public parseMultiplicationExpr(): Expr {
    let expr = this.parseUnaryExpr();
    while (
      this.peek().type === TokenType.STAR ||
      this.peek().type === TokenType.SLASH ||
      this.peek().type === TokenType.MODULO ||
      this.peek().type === TokenType.EXPONENT
    ) {
      const operator = this.consume(this.peek().type);
      const right = this.parseUnaryExpr();
      expr = new BinaryExpr(operator, expr, right);
    }
    return expr;
  }

  public parseUnaryExpr(): Expr {
    if (
      this.peek().type === TokenType.NOT ||
      this.peek().type === TokenType.MINUS
    ) {
      const operator = this.consume(this.peek().type);
      const expr = this.parseUnaryExpr();
      return new UnaryExpr(operator, expr);
    }

    let expr = this.parsePrimaryExpr();
    if (
      this.peek().type === TokenType.DECREMENT ||
      this.peek().type === TokenType.INCREMENT
    ) {
      const operator = this.consume(this.peek().type);
      return new UnaryExpr(operator, expr);
    }

    return expr;
  }
  public parsePrimaryExpr(): Expr {
    if(this.peek().type === TokenType.DELETE){
      return this.parseDeleteExpr();
    }
    if (this.peek().type === TokenType.NUMBER_LITERAL) {
      return this.parseNumberLiteral();
    }
    if (this.peek().type === TokenType.STRING_LITERAL) {
      return this.parseStringLiteral();
    }
    if (this.peek().type === TokenType.IDENTIFIER) {
      return this.parseIdentifierExpr();
    }

    if (this.peek().type === TokenType.OPEN_PAREN) {
      this.consume(TokenType.OPEN_PAREN);
      const expr = this.parseExpr();
      this.consume(TokenType.CLOSE_PAREN);
      return expr;
    }

    if (this.peek().type === TokenType.OPEN_BRACE) {
      return this.parseBlockStatement();
    }

    // if(this.peek().type === TokenType.OPEN_BRACKET) {
    //   return this.parse
    // }

    console.error("Unexpected token", this.peek());
    throw new Error("Unexpected token");
  }
  public produceAST(): Expr {
    const body: Expr[] = [];
    while (!this.isAtEnd()) {
      body.push(this.parseExpr());
    }
    const program = new Program(body);
    return program;
  }
}
export default Parser;
