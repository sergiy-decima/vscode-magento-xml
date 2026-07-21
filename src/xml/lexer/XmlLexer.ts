import { XmlToken } from "./XmlToken";
import { XmlTokenType } from "./XmlTokenType";

export class XmlLexer
{
    private offset = 0;

    /**
     * true = inside <tag ...>
     * false = text node
     */
    private inTag = false;

    public constructor(
        private readonly text: string
    ) {}

    public next(): XmlToken
    {
        while (true) {

            if (this.skipDeclaration()) {
                continue;
            }

            if (this.skipComment()) {
                continue;
            }

            const cdata = this.readCData();

            if (cdata) {
                return cdata;
            }

            break;
        }

        if (this.offset >= this.text.length) {
            return this.token(
                XmlTokenType.EOF,
                "",
                this.offset,
                0
            );
        }

        //
        // Outside tag -> read text
        //
        if (!this.inTag) {

            if (this.startsWith("</")) {
                this.inTag = true;

                const start = this.offset;

                this.offset += 2;

                return this.token(
                    XmlTokenType.OpenCloseTag,
                    "</",
                    start,
                    2
                );
            }

            if (this.current() === "<") {
                this.inTag = true;

                const start = this.offset;

                this.offset++;

                return this.token(
                    XmlTokenType.OpenTag,
                    "<",
                    start,
                    1
                );
            }

            return this.readText();
        }

        //
        // Inside tag
        //
        this.skipWhitespace();

        if (this.offset >= this.text.length) {
            return this.token(
                XmlTokenType.EOF,
                "",
                this.offset,
                0
            );
        }

        const start = this.offset;

        if (this.startsWith("/>")) {

            this.inTag = false;

            this.offset += 2;

            return this.token(
                XmlTokenType.SelfCloseTag,
                "/>",
                start,
                2
            );
        }

        if (this.current() === ">") {

            this.inTag = false;

            this.offset++;

            return this.token(
                XmlTokenType.CloseTag,
                ">",
                start,
                1
            );
        }

        if (this.current() === "=") {

            this.offset++;

            return this.token(
                XmlTokenType.Equals,
                "=",
                start,
                1
            );
        }

        if (
            this.current() === '"' ||
            this.current() === "'"
        ) {
            return this.readString();
        }

        return this.readIdentifier();
    }

    private readIdentifier(): XmlToken
    {
        const start = this.offset;

        while (this.offset < this.text.length) {

            const c = this.current();

            if (
                /[A-Za-z0-9:_\-.]/.test(c)
            ) {
                this.offset++;
                continue;
            }

            break;
        }

        return this.token(
            XmlTokenType.Identifier,
            this.text.substring(start, this.offset),
            start,
            this.offset - start
        );
    }

    private readString(): XmlToken
    {
        const quote = this.current();

        const start = this.offset;

        this.offset++;

        while (
            this.offset < this.text.length &&
            this.current() !== quote
        ) {
            this.offset++;
        }

        const end = this.offset;

        if (this.offset < this.text.length) {
            this.offset++;
        }

        return this.token(
            XmlTokenType.String,
            this.text.substring(start + 1, end),
            start + 1,
            end - start - 1
        );
    }

    private readText(): XmlToken
    {
        const start = this.offset;

        while (
            this.offset < this.text.length &&
            this.current() !== "<"
        ) {
            this.offset++;
        }

        return this.token(
            XmlTokenType.Text,
            this.text.substring(start, this.offset),
            start,
            this.offset - start
        );
    }

    private skipWhitespace(): void
    {
        while (
            this.offset < this.text.length &&
            /\s/.test(this.current())
        ) {
            this.offset++;
        }
    }

    private current(): string
    {
        return this.text[this.offset];
    }

    private startsWith(
        value: string
    ): boolean
    {
        return this.text.startsWith(
            value,
            this.offset
        );
    }

    private token(
        type: XmlTokenType,
        text: string,
        offset: number,
        length: number
    ): XmlToken
    {
        return {
            type,
            text,
            offset,
            length
        };
    }

    /**
     * Skip XML declaration.
     *
     * <?xml version="1.0"?>
     */
    private skipDeclaration(): boolean
    {
        if (!this.startsWith("<?")) {
            return false;
        }

        const end = this.text.indexOf(
            "?>",
            this.offset
        );

        if (end === -1) {
            this.offset = this.text.length;
        } else {
            this.offset = end + 2;
        }

        return true;
    }

    /**
     * Skip comment.
     *
     * <!-- ... -->
     */
    private skipComment(): boolean
    {
        if (!this.startsWith("<!--")) {
            return false;
        }

        const end = this.text.indexOf(
            "-->",
            this.offset
        );

        if (end === -1) {
            this.offset = this.text.length;
        } else {
            this.offset = end + 3;
        }

        return true;
    }

    /**
     * Read CDATA as Text.
     *
     * <![CDATA[ ... ]]>
     */
    private readCData(): XmlToken | undefined
    {
        if (!this.startsWith("<![CDATA[")) {
            return;
        }

        const start = this.offset + 9;

        const end = this.text.indexOf(
            "]]>",
            start
        );

        if (end === -1) {

            const token = this.token(
                XmlTokenType.Text,
                this.text.substring(start),
                start,
                this.text.length - start
            );

            this.offset = this.text.length;

            return token;
        }

        const token = this.token(
            XmlTokenType.Text,
            this.text.substring(start, end),
            start,
            end - start
        );

        this.offset = end + 3;

        return token;
    }
}