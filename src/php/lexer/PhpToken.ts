import { TokenType } from "./TokenType";

/**
 * Single PHP token produced by PhpLexer.
 */
export interface PhpToken {
    readonly type: TokenType;

    readonly text: string;

    /**
     * Offset from beginning of source.
     */
    readonly offset: number;

    /**
     * Token length in characters.
     */
    readonly length: number;
}