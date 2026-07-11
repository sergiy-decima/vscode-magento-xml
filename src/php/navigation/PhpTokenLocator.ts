import { PhpLexer } from "../lexer/PhpLexer";
import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";

/**
 * Finds a PHP token by document offset.
 *
 * Used by:
 * - Go to Definition
 * - Hover
 * - Completion
 * - References
 */
export class PhpTokenLocator {
    /**
     * Finds token containing the given offset.
     */
    public locate(content: string, offset: number): PhpToken | undefined {
        const lexer = new PhpLexer(content);
        while (lexer.scan() !== TokenType.EOF) {
            const token = lexer.token();
            if (offset >= token.offset && offset < token.offset + token.length) {
                return token;
            }
        }

        return undefined;
    }
}