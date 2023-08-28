import TokenType from "./TokenType";

class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: any,
    public line: number,
  ) {}

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

export default Token;
