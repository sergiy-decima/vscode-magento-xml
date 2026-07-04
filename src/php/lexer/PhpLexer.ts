import { TokenType } from "./TokenType";

const keywords = new Map<string, TokenType>([
    ["namespace", TokenType.Namespace],
    ["class", TokenType.Class],
    ["interface", TokenType.Interface],
    ["trait", TokenType.Trait],
    ["enum", TokenType.Enum],
    ["abstract", TokenType.Abstract],
    ["final", TokenType.Final],
    ["readonly", TokenType.Readonly],
]);

export class PhpLexer {
    private pos = 0;
    private token = TokenType.EOF;
    private text = "";

    constructor(private readonly source: string) {}

    public scan(): TokenType {
        this.skipTrivia();
        if (this.pos >= this.source.length) {
            this.token = TokenType.EOF;
            this.text = "";
            return this.token;
        }

        const ch = this.source[this.pos];
        switch (ch) {
            case "\\":
                this.pos++;
                this.text = "\\";
                return this.token = TokenType.NamespaceSeparator;

            case "{":
                this.pos++;
                this.text = "{";
                return this.token = TokenType.OpenBrace;

            case "}":
                this.pos++;
                this.text = "}";
                return this.token = TokenType.CloseBrace;

            case ";":
                this.pos++;
                this.text = ";";
                return this.token = TokenType.Semicolon;
        }

        if (this.isIdentifierStart(ch)) {
            const start = this.pos;
            this.pos++;
            while (this.pos < this.source.length && this.isIdentifierPart(this.source[this.pos])) {
                this.pos++;
            }
            this.text = this.source.substring(start, this.pos);
            this.token = keywords.get(this.text) ?? TokenType.Identifier;

            return this.token;
        }
        this.pos++;
        this.text = ch;

        return this.token = TokenType.Unknown;
    }

    public tokenType(): TokenType {
        return this.token;
    }

    public tokenText(): string {
        return this.text;
    }

    // -----------------------------
    private skipTrivia(): void {
        while (this.pos < this.source.length) {
            const ch = this.source[this.pos];

            // <?php
            if (this.source.startsWith("<?php", this.pos)) {
                this.pos += 5;
                continue;
            }

            // <?=
            if (this.source.startsWith("<?=", this.pos)) {
                this.pos += 3;
                continue;
            }

            // <?
            if (this.source.startsWith("<?", this.pos)) {
                this.pos += 2;
                continue;
            }

            // ?>
            if (this.source.startsWith("?>", this.pos)) {
                this.pos += 2;
                continue;
            }

            if (this.pos === 0 && this.source.charCodeAt(0) === 0xFEFF) {
                this.pos++;
                continue;
            }

            // whitespace
            if (/\s/.test(ch)) {
                this.pos++;
                continue;
            }

            // //
            if (ch === "/" && this.source[this.pos + 1] === "/") {
                this.pos += 2;
                while (this.pos < this.source.length && this.source[this.pos] !== "\n") {
                    this.pos++;
                }
                continue;
            }

            // #
            if (ch === "#") {
                this.pos++;
                while (this.pos < this.source.length && this.source[this.pos] !== "\n") {
                    this.pos++;
                }
                continue;
            }

            // /* */
            if (ch === "/" && this.source[this.pos + 1] === "*") {
                this.pos += 2;
                while (this.pos + 1 < this.source.length 
                    && !(this.source[this.pos] === "*" && this.source[this.pos + 1] === "/")
                ) {
                    this.pos++;
                }
                this.pos += 2;
                continue;
            }

            break;
        }
    }

    private isIdentifierStart(ch: string): boolean {
        return /[A-Za-z_]/.test(ch);
    }

    private isIdentifierPart(ch: string): boolean {
        return /[A-Za-z0-9_]/.test(ch);
    }

    private static isWhitespace(ch: number): boolean {
        return (
            ch === 0x20 || // space
            ch === 0x09 || // tab
            ch === 0x0A || // \n
            ch === 0x0D    // \r
        );
    }

    private static isIdentifierStart(ch: number): boolean {
        return (
            (ch >= 65 && ch <= 90) ||   // A-Z
            (ch >= 97 && ch <= 122) ||  // a-z
            ch === 95                   // _
        );
    }
}