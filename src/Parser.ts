import Token from "./Token";
import TokenType from "./TokenType";
import {
  BinaryExpr,
  CallExpr,
  Expr,
  GroupingExpr,
  LiteralExpr,
  Stmt,
  VariableExpr,
} from "./Expression";
import {
  AssignmentStatementStmt,
  BlockStatementStmt,
  FunctionCallStatementStmt,
  FunctionDefinitionStmt,
  FunctionStatementStmt,
  IfStatementStmt,
  ReturnStmt,
  VarDeclarationStmt,
  WhileStatementStmt,
} from "./Statements";
import { ExprType } from "./ExprType";

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

  private parseComparisonExpression(): Expr {
    let expr = this.parseAddition();

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
      const right = this.parseLogicalAndExpression();
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

  private parseAddition(): Expr {
    let expr = this.parseMultiplication();

    while (this.match([TokenType.PLUS, TokenType.MINUS])) {
      const operator = this.previous();
      const right = this.parseMultiplication();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private parseMultiplication(): Expr {
    let expr = this.parsePrimary();

    while (this.match([TokenType.MULTIPLY, TokenType.DIVIDE])) {
      const operator = this.previous();
      const right = this.parsePrimary();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private parsePrimary(): Expr {
    if (this.match([TokenType.NUMBER, TokenType.STRING_LITERAL])) {
      return new LiteralExpr(this.previous());
    }

    if (this.match([TokenType.IDENTIFIER])) {
      const identifier = new VariableExpr(this.previous());
      if (this.check(TokenType.LEFT_PAREN)) {
        const args = this.parseFunctionCallArguments();
        return new CallExpr(identifier, args);
      }
      return new VariableExpr(this.previous());
    }

    if (this.match([TokenType.LEFT_PAREN])) {
      const expr = this.parseExpression();
      this.consume(
        TokenType.RIGHT_PAREN,
        "Expect closing parenthesis after expression.",
      );
      return new GroupingExpr(expr);
    }

    // Handle more cases as needed, like function calls or other primary expressions

    throw new ParserError("Expect expression.", this.peek(), this.peek().line);
  }

  private parseFunctionCallArguments(): Expr[] {
    const args: Expr[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match([TokenType.COMMA]));
    }

    this.consume(
      TokenType.RIGHT_PAREN,
      "Expect closing parenthesis after function arguments.",
    );
    return args;
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
      "Expect semicolon after variable declaration.",
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
    const variable = this.previous();
    this.consume(TokenType.ASSIGN, 'Expect "=" after variable name.');

    let value: Expr;
    this.consume(TokenType.IDENTIFIER, "Expected Identifier");

    if (this.peek().type === TokenType.LEFT_PAREN) {
      // It's a function call
      const functionName = this.previous();
      const args = this.parseFunctionCallArguments();
      value = new CallExpr(new VariableExpr(functionName), args);
    } else {
      // It's an expression
      value = this.parseExpression();
    }

    this.consume(TokenType.SEMICOLON, 'Expect ";" after assignment.');
    return new AssignmentStatementStmt(variable, value);
  }

  private parseReturnStatement(): Stmt {
    let value: Expr | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.parseExpression();
    }

    this.consume(TokenType.SEMICOLON, "Expect semicolon after return value.");
    return new ReturnStmt(value);
  }

  private parseFunctionDefinitionStatement(): Stmt {
    const functionName = this.consume(
      TokenType.IDENTIFIER,
      "Expect function name.",
    );

    this.consume(TokenType.LEFT_PAREN, 'Expect "(" after function name.');
    const parameters: Token[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        const paramName = this.consume(
          TokenType.IDENTIFIER,
          "Expect parameter name.",
        );
        parameters.push(paramName);
      } while (this.match([TokenType.COMMA]));
    }

    this.consume(
      TokenType.RIGHT_PAREN,
      'Expect ")" after function parameters.',
    );

    const body: BlockStatementStmt = this.parseBlock();

    return new FunctionDefinitionStmt(functionName, parameters, body);
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
    if (this.match([TokenType.FUNCTION])) {
      return this.parseFunctionDefinitionStatement();
    }
    if (this.match([TokenType.RETURN])) {
      return this.parseReturnStatement();
    }
    // Implement parsing of other statement types here

    throw new ParserError(
      `Unexpected token at line ${this.tokens[this.current].line}`,
      this.tokens[this.current],
      this.tokens[this.current].line,
    );
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
    super(error);
    this.token = token;
    this.line = line;
  }
}
