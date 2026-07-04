import { TokenType } from "./TokenType";

export interface Token {
    type: TokenType;
    text: string;
    offset: number;
}