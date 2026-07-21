import { XmlToken } from "../lexer/XmlToken";
import { XmlTokenType } from "../lexer/XmlTokenType";
import { XmlTokenStream } from "./XmlTokenStream";

export abstract class XmlParserBase
{
    protected constructor(
        protected readonly stream: XmlTokenStream
    ) {}

    protected token(): XmlToken
    {
        return this.stream.current();
    }

    protected tokenType(): XmlTokenType
    {
        return this.stream.current().type;
    }

    protected tokenText(): string
    {
        return this.stream.current().text;
    }

    protected next(): void
    {
        this.stream.next();
    }

    protected eof(): boolean
    {
        return this.stream.eof();
    }

    protected match(
        type: XmlTokenType
    ): boolean
    {
        if (this.tokenType() !== type) {
            return false;
        }

        this.next();

        return true;
    }

    protected peek(
        distance = 1
    ): XmlToken
    {
        return this.stream.peek(distance);
    }

    protected save(): number
    {
        return this.stream.position();
    }

    protected restore(
        position: number
    ): void
    {
        this.stream.restore(position);
    }
}