import Token from "./Token";
import TokenType from "./TokenType";
import {
  BinaryExpr,
  Expr,
  LiteralExpr,
  Stmt,
  VariableExpr,
} from "./Expression";
import {
  AssignmentStatementStmt,
  BlockStatementStmt,
  FunctionCallStatementStmt,
  IfStatementStmt,
  VarDeclarationStmt,
  WhileStatementStmt,
} from "./Statements";

export class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  // Token Handling Methods
  private match(types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new ParserError(message, this.peek(), this.peek().line);
  }

  // Parsing Methods for Expressions
  private parsePrimaryExpression(): Expr {
    if (this.match([TokenType.NUMBER, TokenType.STRING_LITERAL])) {
      return new LiteralExpr(this.previous().literal);
    }
    if (this.match([TokenType.IDENTIFIER])) {
      return new VariableExpr(this.previous());
    }
    throw new ParserError(`Unexpected token at line ${this.tokens[this.current].line}`, this.tokens[this.current], this.tokens[this.current].line);
  }

  private parseComparisonExpression(): Expr {
    let expr = this.parsePrimaryExpression();

    const comparisonOperators = [
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS,
      TokenType.LESS_EQUAL,
      TokenType.EQUAL,
      TokenType.NOT_EQUAL,
    ];

    while (this.match(comparisonOperators)) {
      const operator = this.previous();
      const right = this.parsePrimaryExpression();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private parseLogicalAndExpression(): Expr {
    let expr = this.parseComparisonExpression();

    while (this.match([TokenType.AND])) {
      const operator = this.previous();
      const right = this.parseComparisonExpression();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private parseLogicalOrExpression(): Expr {
    let expr = this.parseLogicalAndExpression();

    while (this.match([TokenType.OR])) {
      const operator = this.previous();
      const right = this.parseLogicalAndExpression();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private parseConditionalExpression(): Expr {
    let expr = this.parseLogicalOrExpression();

    if (this.match([TokenType.AND, TokenType.OR])) {
      const operator = this.previous();
      const right = this.parseLogicalOrExpression();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private parseExpression(): Expr {
    return this.parseConditionalExpression();
  }

  // Parsing Methods for Statements
  private parseVarDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
    let initializer: Expr | null = null;
    if (this.match([TokenType.ASSIGN])) {
      initializer = this.parseExpression();
    }
    this.consume(
      TokenType.SEMICOLON,
      "Expect semicolon after variable declaration."
    );
    return new VarDeclarationStmt(name, initializer);
  }

  private parseIfStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, 'Expect "(" after if.');
    const condition = this.parseExpression();
    this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after if condition.');

    const thenBranch = this.parseBlock();

    let elseBranch: Stmt | null = null;
    if (this.match([TokenType.ELSE])) {
      elseBranch = this.parseBlock();
    }

    return new IfStatementStmt(condition, thenBranch, elseBranch);
  }

  private parseWhileStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.parseExpression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");

    const body = this.parseBlock();

    return new WhileStatementStmt(condition, body);
  }

  private parseAssignmentStatement(): Stmt {
    const name = this.previous();
    this.consume(TokenType.ASSIGN, 'Expect "=" after variable name.');
    const value = this.parseExpression();
    this.consume(
      TokenType.SEMICOLON,
      "Expect semicolon after assignment statement."
    );
    return new AssignmentStatementStmt(name, value);
  }

  private parseFunctionCallStatement(): Stmt {
    const functionName = this.previous();
    this.consume(TokenType.LEFT_PAREN, 'Expect "(" after function name.');
    const args: Expr[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match([TokenType.COMMA]));
    }

    this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after function arguments.');
    this.consume(TokenType.SEMICOLON, "Expect semicolon after function call.");
    return new FunctionCallStatementStmt(functionName, args);
  }

  private parseBlock(): BlockStatementStmt {
    const statements: Stmt[] = [];

    this.consume(TokenType.LEFT_BRACE, "Expect '{' before block.");
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");

    return new BlockStatementStmt(statements);
  }

  private parseStatement(): Stmt {
    if (this.match([TokenType.VAR])) {
      return this.parseVarDeclaration();
    }
    if (this.match([TokenType.IF])) {
      return this.parseIfStatement();
    }
    if (this.match([TokenType.WHILE])) {
      return this.parseWhileStatement();
    }
    if (this.match([TokenType.IDENTIFIER])) {
      if (this.check(TokenType.LEFT_PAREN)) {
        return this.parseFunctionCallStatement();
      }
      if (this.check(TokenType.ASSIGN)) {
        return this.parseAssignmentStatement();
      }
    }
    // Implement parsing of other statement types here

    throw new ParserError(`Unexpected token at line ${this.tokens[this.current].line}`, this.tokens[this.current], this.tokens[this.current].line);
  }

  public parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    return statements;
  }
}


class ParserError extends Error {
  // include error, token and line number
  constructor(
    public error: string,
    public token: Token,
    public line: number,
  ) {
    super(error)
    this.token = token;
    this.line = line;
  }
}