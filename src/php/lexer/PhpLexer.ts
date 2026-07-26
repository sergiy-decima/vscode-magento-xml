import { PhpToken } from "./PhpToken";
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
    ["extends", TokenType.Extends],
    ["implements", TokenType.Implements],
    ["use", TokenType.Use],
    ["as", TokenType.As],
    ["function", TokenType.Function],
    ["public", TokenType.Public],
    ["protected", TokenType.Protected],
    ["private", TokenType.Private],
    ["static", TokenType.Static],
    ["const", TokenType.Const],
    ["new", TokenType.New],
    ["instanceof", TokenType.Instanceof],
]);

export class PhpLexer {
    private current: PhpToken = {
        type: TokenType.EOF,
        text: "",
        offset: 0,
        length: 0
    };
    private pos = 0;

    constructor(private readonly source: string) {}

    public scan(): TokenType {
        this.skipTrivia();
        if (this.pos >= this.source.length) {
            this.current = {
                type: TokenType.EOF,
                text: "",
                offset: this.pos,
                length: 0
            };

            return this.current.type;
        }

        const start = this.pos;
        const ch = this.source[this.pos];
        switch (ch) {
            case "\\":
                this.pos++;
                this.current = {
                    type: TokenType.NamespaceSeparator,
                    text: "\\",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "{":
                this.pos++;
                this.current = {
                    type: TokenType.OpenBrace,
                    text: "{",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "}":
                this.pos++;
                this.current = {
                    type: TokenType.CloseBrace,
                    text: "}",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case ";":
                this.pos++;
                this.current = {
                    type: TokenType.Semicolon,
                    text: ";",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case ",":
                this.pos++;
                this.current = {
                    type: TokenType.Comma,
                    text: ",",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "(":
                this.pos++;
                this.current = {
                    type: TokenType.OpenParen,
                    text: "(",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case ")":
                this.pos++;
                this.current = {
                    type: TokenType.CloseParen,
                    text: ")",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case ":":
                if (this.source[this.pos + 1] === ":") {
                    this.pos += 2;
                    this.current = {
                        type: TokenType.DoubleColon,
                        text: "::",
                        offset: start,
                        length: 2
                    };
                    return this.current.type;
                }
                
                this.pos++;
                this.current = {
                    type: TokenType.Colon,
                    text: ":",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "=":
                this.pos++;
                this.current = {
                    type: TokenType.Equals,
                    text: "=",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "&":
                this.pos++;
                this.current = {
                    type: TokenType.Ampersand,
                    text: "&",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "|":
                this.pos++;
                this.current = {
                    type: TokenType.Pipe,
                    text: "|",
                    offset: start,
                    length: 1
                };
                return this.current.type;

            case "?":
                this.pos++;
                this.current = {
                    type: TokenType.Question,
                    text: "?",
                    offset: start,
                    length: 1
                };
                return this.current.type;
        }

        if (ch === "$") {
            this.pos++;
            while (this.pos < this.source.length && this.isIdentifierPart(this.source[this.pos])) {
                this.pos++;
            }

            const text = this.source.substring(start, this.pos);
            this.current = {
                type: TokenType.Variable,
                text,
                offset: start,
                length: this.pos - start
            };

            return this.current.type;
        }

        if (this.isIdentifierStart(ch)) {
            this.pos++;
            while (this.pos < this.source.length && this.isIdentifierPart(this.source[this.pos])) {
                this.pos++;
            }

            const text = this.source.substring(start, this.pos);
            this.current = {
                type: keywords.get(text) ?? TokenType.Identifier,
                text,
                offset: start,
                length: this.pos - start
            };

            return this.current.type;
        }

        this.pos++;
        this.current = {
            type: TokenType.Unknown,
            text: ch,
            offset: start,
            length: 1
        };

        return this.current.type;
    }

    public token(): Readonly<PhpToken> {
        return this.current;
    }

    public tokenType(): TokenType {
        return this.current.type;
    }

    public tokenText(): string {
        return this.current.text;
    }

    public tokenOffset(): number {
        return this.current.offset;
    }

    public tokenLength(): number {
        return this.current.length;
    }

    public tokenEnd(): number {
        return this.current.offset + this.current.length;
    }





    // private finish(
    //     token: TokenType,
    //     text: string
    // ): TokenType {
    //     this.token = token;
    //     this.text = text;
    //     this.length = this.pos - this.offset;

    //     return token;
    // }

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
            if (PhpLexer.isWhitespace(ch.charCodeAt(0))) { // або /\s/.test(ch)
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

            return;
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

    public clone(): PhpLexer
    {
        const lexer = new PhpLexer(this.source);
        lexer.pos = this.pos;
        lexer.current = { ...this.current };

        return lexer;
    }
}