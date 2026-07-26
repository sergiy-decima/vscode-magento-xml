import { PhpLexer } from "../lexer/PhpLexer";
import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";

export interface PhpTokenContext
{
    previous?: PhpToken;

    current: PhpToken;

    next?: PhpToken;
}

/**
 * Finds token under cursor together with neighbour tokens.
 */
export class PhpTokenLocator {
    public find(
        content: string,
        offset: number
    ): PhpTokenContext | undefined
    {
        const lexer = new PhpLexer(content);

        let previous: PhpToken | undefined;
        let current: PhpToken | undefined;

        while (true) {

            const type = lexer.scan();

            if (type === TokenType.EOF) {
                return undefined;
            }

            current = lexer.token();

            if (
                offset >= current.offset &&
                offset < current.offset + current.length
            ) {

                lexer.scan();

                const next =
                    lexer.tokenType() === TokenType.EOF
                        ? undefined
                        : lexer.token();

                return {
                    previous,
                    current,
                    next
                };
            }

            previous = current;
        }
    }
}