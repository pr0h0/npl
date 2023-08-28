import Token from "./Token";
import TokenType from "./TokenType";

class Lexer {
  private readonly source: string;
  private readonly tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    const char = this.source[this.current];
    if (char === "\n") {
      this.line++; // Increment line number on newline
    }
    this.current++;
    return char;
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private identifier(): void {
    while (!this.isAtEnd() && this.source.charAt(this.current).match(/\w/)) {
      this.advance();
    }
    const text = this.source.substring(this.start, this.current);
    // @ts-ignore
    const keywordType = TokenType[text.toUpperCase()] || TokenType.IDENTIFIER;
    this.addToken(keywordType);
  }

  private stringLiteral(): void {
    while (!this.isAtEnd() && this.source.charAt(this.current) !== '"') {
      if (this.source.charAt(this.current) === "\n") {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }

    this.advance(); // Consume the closing quote
    const stringValue = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING_LITERAL, stringValue);
  }

  private number(): void {
    while (!this.isAtEnd() && this.source.charAt(this.current).match(/\d/)) {
      this.advance();
    }

    if (
      this.source.charAt(this.current) === "." &&
      this.source.charAt(this.current + 1).match(/\d/)
    ) {
      this.advance(); // Consume the dot
      while (!this.isAtEnd() && this.source.charAt(this.current).match(/\d/)) {
        this.advance();
      }
    }

    const numberValue = parseFloat(
      this.source.substring(this.start, this.current)
    );
    this.addToken(TokenType.NUMBER, numberValue);
  }

  private scanToken(): void {
    const char = this.advance();
    switch (char) {
      // Single-character tokens
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "*":
        this.addToken(TokenType.MULTIPLY);
        break;
      case "/":
        if (this.match("/")) {
          // Single-line comment, advance until the end of line
          while (this.source.charAt(this.current) !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match("*")) {
          // Multi-line comment, advance until '*/' is found
          while (
            !(this.match("*") && this.source.charAt(this.current + 1) === "/")
          ) {
            this.advance();
          }
          // Skip the '*/'
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.DIVIDE);
        }
        break;
      case "%":
        this.addToken(TokenType.MODULO);
        break;
      case "=":
        this.addToken(TokenType.ASSIGN);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case ":":
        this.addToken(TokenType.COLON);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case "[":
        this.addToken(TokenType.LEFT_SQUARE_BRACKET);
        break;
      case "]":
        this.addToken(TokenType.RIGHT_SQUARE_BRACKET);
        break;

      // Operators
      case "!":
        this.addToken(this.match("=") ? TokenType.NOT_EQUAL : TokenType.NOT);
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "&":
        this.addToken(TokenType.AND);
        break;
      case "|":
        this.addToken(TokenType.OR);
        break;

      // Increment and Decrement
      case "+":
        this.addToken(this.match("+") ? TokenType.INCREMENT : TokenType.PLUS);
        break;
      case "-":
        this.addToken(this.match("-") ? TokenType.DECREMENT : TokenType.MINUS);
        break;

      // String literals
      case '"':
        this.stringLiteral();
        break;

      // Whitespace
      case " ":
      case "\r":
      case "\t":
        break;

      case "\n":
        this.line++;
        break;

      default:
        if (char.match(/\d/)) {
          this.number();
        } else if (char.match(/\w/)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character at line ${this.line}`);
        }
    }
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line+1));
    return this.tokens;
  }
}

export default Lexer;
