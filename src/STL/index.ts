import { Environment } from "../Environment";
import { print } from "./Functions";

export const registerVariables = (environment: Environment) => {
  environment["version"] = "0.0.1";
};

export const registerFunctions = (environment: Environment) => {
  environment["print"] = print();
};
