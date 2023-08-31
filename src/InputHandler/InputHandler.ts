import readline from "readline-sync";

class InputHandler {
  static readInput(prompt: string): string {
    const input = readline.question(prompt);
    return input;
  }
}

export default InputHandler;
