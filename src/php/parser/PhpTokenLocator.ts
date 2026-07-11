import { PhpLexer } from "../lexer/PhpLexer";
import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";

/**
 * Finds a token at a given document offset.
 */
export class PhpTokenLocator {
    /**
     * Returns the token containing the specified offset.
     */
    public find(
        content: string,
        offset: number
    ): PhpToken | undefined {
        const lexer = new PhpLexer(content);
        while (true) {
            const type = lexer.scan();
            if (type === TokenType.EOF) {
                return undefined;
            }

            const token = lexer.token();
            if (
                offset >= token.offset &&
                offset < token.offset + token.length
            ) {
                return token;
            }
        }
    }
}