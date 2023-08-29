import TokenType from "./TokenType";

class Token {
  constructor(
    public type: TokenType,
    public value: string,
    public lineNumber: number
  ) {}
}

export default Token;
