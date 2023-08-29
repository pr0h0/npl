import Token from "./Token";
import TokenType from "./TokenType";

class Lexer {
  constructor(sourceCode: string) {
    this.sourceCode = sourceCode.split("");
  }

  public sourceCode: string[] = [];
  public currentLineNumber: number = 1;
  public currentLine: string = "";
  public tokens: Token[] = [];

  public peek(): string {
    return this.sourceCode[0];
  }

  public eat(): string {
    return this.sourceCode.shift() || "";
  }

  public isAlpha(char: string): boolean {
    return /[a-z]/i.test(char);
  }

  public isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  public isValidNumberLiteral(numberLiteral: string): boolean {
    return /^[0-9]+(\.[0-9]+)?$/.test(numberLiteral);
  }

  public isValidIdentifier(identifier: string): boolean {
    return /^[a-z_][_a-z0-9]*$/i.test(identifier);
  }

  public parseStringLiteral(endCharacter: string): string {
    let stringLiteral: string = "";

    while (this.sourceCode.length && this.peek() !== endCharacter) {
      stringLiteral += this.eat();
    }

    this.eat(); // eat the endCharacter

    return stringLiteral;
  }

  public parseNumberLiteral(): number {
    let numberLiteral: string = "";

    while (
      (this.sourceCode.length && this.isDigit(this.peek())) ||
      this.peek() === "."
    ) {
      numberLiteral += this.eat();
    }

    if (!this.isValidNumberLiteral(numberLiteral)) {
      throw new Error(
        `Invalid number literal at line ${this.currentLineNumber}: ${numberLiteral} `
      );
    }

    return parseFloat(numberLiteral);
  }

  public parseIdentifier(): string {
    let identifierName: string = "";

    while (
      (this.sourceCode.length && this.isAlpha(this.peek())) ||
      this.isDigit(this.peek()) ||
      this.peek() === "_"
    ) {
      identifierName += this.eat();
    }

    if (!this.isValidIdentifier(identifierName)) {
      throw new Error(
        `Invalid identifier at line ${this.currentLineNumber}: ${identifierName}`
      );
    }

    return identifierName;
  }

  public parseNewLine(): void {
    this.eat();
    this.currentLineNumber++;
    this.currentLine = "";
  }

  public parseSingeLineComment(): void {
    while (this.sourceCode.length && this.peek() !== "\n") {
      this.eat();
    }

    this.parseNewLine();
  }

  public parseMultiLineComment(): void {
    while (
      this.sourceCode.length &&
      (this.peek() !== "*" || this.sourceCode[1] !== "/")
    ) {
      if (this.peek() === "\n") {
        this.parseNewLine();
        continue;
      }
      this.eat();
    }

    this.eat(); // eat the "*"
    this.eat(); // eat the "/"
  }

  public parseOperator(): void {
    switch (this.peek()) {
      case "+":
        if (this.sourceCode[1] === "+") {
          this.tokens.push(
            new Token(
              TokenType.INCREMENT,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else if (this.sourceCode[1] === "=") {
          this.tokens.push(
            new Token(
              TokenType.PLUS_ASSIGN,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else {
          this.tokens.push(
            new Token(TokenType.PLUS, this.eat(), this.currentLineNumber)
          );
        }
        break;
      case "-":
        if (this.sourceCode[1] === "-") {
          this.tokens.push(
            new Token(
              TokenType.DECREMENT,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else if (this.sourceCode[1] === "=") {
          this.tokens.push(
            new Token(
              TokenType.MINUS_ASSIGN,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else {
          this.tokens.push(
            new Token(TokenType.MINUS, this.eat(), this.currentLineNumber)
          );
        }
        break;
      case "*":
        if (this.sourceCode[1] === "=") {
          this.tokens.push(
            new Token(
              TokenType.STAR_ASSIGN,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else if (this.sourceCode[1] === "*") {
          this.tokens.push(
            new Token(
              TokenType.EXPONENT,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else {
          this.tokens.push(
            new Token(TokenType.STAR, this.eat(), this.currentLineNumber)
          );
        }
        break;
      case "/":
        if (this.sourceCode[1] === "=") {
          this.tokens.push(
            new Token(
              TokenType.SLASH_ASSIGN,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else if (this.sourceCode[1] === "/") {
          this.parseSingeLineComment();
        } else if (this.sourceCode[1] === "*") {
          this.parseMultiLineComment();
        } else {
          this.tokens.push(
            new Token(TokenType.SLASH, this.eat(), this.currentLineNumber)
          );
        }
        break;
      case "%":
        if (this.sourceCode[1] === "=") {
          this.tokens.push(
            new Token(
              TokenType.MODULO_ASSIGN,
              this.eat() + this.eat(),
              this.currentLineNumber
            )
          );
        } else {
          this.tokens.push(
            new Token(TokenType.MODULO, this.eat(), this.currentLineNumber)
          );
        }
        break;
    }
  }

  public tokenize(): Token[] {
    while (this.sourceCode.length) {
      switch (this.peek()) {
        case "\n":
          this.parseNewLine();
          break;
        case " ":
        case "\t":
        case "\r":
          this.eat();
          break;
        case '"':
        case "'":
        case "`":
          this.tokens.push(
            new Token(
              TokenType.STRING_LITERAL,
              this.parseStringLiteral(this.eat()),
              this.currentLineNumber
            )
          );
          break;
        case "+":
        case "-":
        case "*":
        case "/":
        case "%":
          this.parseOperator();
          break;
        case "=":
          if (this.sourceCode[1] === "=") {
            this.tokens.push(
              new Token(
                TokenType.EQUAL,
                this.eat() + this.eat(),
                this.currentLineNumber
              )
            );
          } else {
            this.tokens.push(
              new Token(TokenType.ASSIGN, this.eat(), this.currentLineNumber)
            );
          }
          break;

        case "!":
          if (this.sourceCode[1] === "=") {
            this.tokens.push(
              new Token(
                TokenType.NOT_EQUAL,
                this.eat() + this.eat(),
                this.currentLineNumber
              )
            );
          } else {
            this.tokens.push(
              new Token(TokenType.NOT, this.eat(), this.currentLineNumber)
            );
          }
          break;

        case ">":
          if (this.sourceCode[1] === "=") {
            this.tokens.push(
              new Token(
                TokenType.GREATER_EQUAL,
                this.eat() + this.eat(),
                this.currentLineNumber
              )
            );
          } else {
            this.tokens.push(
              new Token(TokenType.GREATER, this.eat(), this.currentLineNumber)
            );
          }
          break;
        case "<":
          if (this.sourceCode[1] === "=") {
            this.tokens.push(
              new Token(
                TokenType.LESS_EQUAL,
                this.eat() + this.eat(),
                this.currentLineNumber
              )
            );
          } else {
            this.tokens.push(
              new Token(TokenType.LESS, this.eat(), this.currentLineNumber)
            );
          }
          break;
        case "&":
          if (this.sourceCode[1] === "&") {
            this.tokens.push(
              new Token(
                TokenType.AND,
                this.eat() + this.eat(),
                this.currentLineNumber
              )
            );
          } else {
            throw new Error(
              `Invalid character at line ${
                this.currentLineNumber
              }: ${this.eat()}`
            );
          }
          break;
        case "|":
          if (this.sourceCode[1] === "|") {
            this.tokens.push(
              new Token(
                TokenType.OR,
                this.eat() + this.eat(),
                this.currentLineNumber
              )
            );
          } else {
            throw new Error(
              `Invalid character at line ${
                this.currentLineNumber
              }: ${this.eat()}`
            );
          }
          break;
        case "(":
          this.tokens.push(
            new Token(TokenType.OPEN_PAREN, this.eat(), this.currentLineNumber)
          );
          break;
        case ")":
          this.tokens.push(
            new Token(TokenType.CLOSE_PAREN, this.eat(), this.currentLineNumber)
          );
          break;
        case "{":
          this.tokens.push(
            new Token(TokenType.OPEN_BRACE, this.eat(), this.currentLineNumber)
          );
          break;
        case "}":
          this.tokens.push(
            new Token(TokenType.CLOSE_BRACE, this.eat(), this.currentLineNumber)
          );
          break;
        case "[":
          this.tokens.push(
            new Token(
              TokenType.OPEN_BRACKET,
              this.eat(),
              this.currentLineNumber
            )
          );
          break;
        case "]":
          this.tokens.push(
            new Token(
              TokenType.CLOSE_BRACKET,
              this.eat(),
              this.currentLineNumber
            )
          );
          break;
        case ",":
          this.tokens.push(
            new Token(TokenType.COMMA, this.eat(), this.currentLineNumber)
          );
          break;
        case ".":
          this.tokens.push(
            new Token(TokenType.DOT, this.eat(), this.currentLineNumber)
          );
          break;
        case ":":
          this.tokens.push(
            new Token(TokenType.COLON, this.eat(), this.currentLineNumber)
          );
          break;
        case ";":
          this.tokens.push(
            new Token(TokenType.SEMICOLON, this.eat(), this.currentLineNumber)
          );
          break;
        default:
          if (this.isDigit(this.peek())) {
            this.tokens.push(
              new Token(
                TokenType.NUMBER_LITERAL,
                this.parseNumberLiteral().toString(),
                this.currentLineNumber
              )
            );
          } else if (this.isValidIdentifier(this.peek())) {
            this.tokens.push(
              new Token(
                TokenType.IDENTIFIER,
                this.parseIdentifier(),
                this.currentLineNumber
              )
            );
          } else {
            throw new Error(
              `Invalid character at line ${
                this.currentLineNumber
              }: ${this.eat()}`
            );
          }
          break;
      }
    }
    this.tokens.push(new Token(TokenType.EOF, "", this.currentLineNumber));
    return this.tokens;
  }
}

export default Lexer;
