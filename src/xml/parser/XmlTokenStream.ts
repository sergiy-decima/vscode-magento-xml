import { XmlLexer } from "../lexer/XmlLexer";
import { XmlToken } from "../lexer/XmlToken";
import { XmlTokenType } from "../lexer/XmlTokenType";

export class XmlTokenStream
{
    private readonly tokens: XmlToken[] = [];

    private index = 0;

    public constructor(
        lexer: XmlLexer
    ) {
        while (true) {

            const token = lexer.next();

            this.tokens.push(token);

            if (token.type === XmlTokenType.EOF) {
                break;
            }
        }
    }

    public current(): XmlToken
    {
        return this.tokens[this.index];
    }

    public next(): XmlToken
    {
        if (this.index < this.tokens.length - 1) {
            this.index++;
        }

        return this.current();
    }

    public peek(
        distance = 1
    ): XmlToken
    {
        return this.tokens[
            Math.min(
                this.index + distance,
                this.tokens.length - 1
            )
        ];
    }

    public eof(): boolean
    {
        return this.current().type === XmlTokenType.EOF;
    }

    public position(): number
    {
        return this.index;
    }

    public restore(
        position: number
    ): void
    {
        this.index = position;
    }
}