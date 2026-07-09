import { TokenType } from "../lexer/TokenType";
import { PhpType } from "../ast/PhpType";
import { PhpTypeKind } from "../ast/PhpTypeKind";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";

export interface PhpParserInterface {
    parse(): PhpType[];
    parseFirst(): PhpType | undefined;
}

/**
 * PHP type scanner.
 *
 * Знаходить PHP-типи:
 * - namespace
 * - class
 * - interface
 * - trait
 * - enum
 * - extends
 * - implements
 * - trait usage
 */
export class PhpTypeParser extends PhpParserBase implements PhpParserInterface {
    constructor(stream: PhpTokenStream) {
        super(stream);
    }

    public parse(): PhpType[] {
        // const scanner = new PhpTypeParser(document.content);
        const result: PhpType[] = [];
        let namespace = "";
        while (!this.eof()) {
            if (this.match(TokenType.Namespace)) {
                namespace = this.readNamespace();
                continue;
            }

            if (this.isTypeKeyword()) {
                const type = this.readPhpType(namespace, this.tokenType());
                if (type) {
                    result.push(type);
                }
                continue;
            }
            this.next();
        }

        return result;
    }

    public parseFirst(): PhpType | undefined {
        const list = this.parse();
        return list[0];
    }

    private readNamespace(): string {
        const parts: string[] = [];
        while (!this.eof()) {
            if (this.tokenType() === TokenType.Identifier) {
                parts.push(this.tokenText());
                this.next();
                continue;
            }

            if (this.match(TokenType.NamespaceSeparator)) {
                continue;
            }

            if (
                this.match(TokenType.Semicolon) ||
                this.match(TokenType.OpenBrace)
            ) {
                break;
            }
            break;
        }

        return parts.join("\\");
    }

    private readPhpType(
        namespace: string,
        keyword: TokenType
    ): PhpType | undefined {
        this.next();
        if (this.tokenType() !== TokenType.Identifier) {
            return;
        }

        const nameToken = this.token();
        const shortName = nameToken.text;
        const fqcn = namespace ? `${namespace}\\${shortName}` : shortName;
        const type: PhpType = {
            fqcn,
            namespace,
            shortName,
            kind: this.mapKind(keyword),
            offset: nameToken.offset,
            length: nameToken.length,
            extends: undefined,
            implements: [],
            traits: []
        };
        this.next();
        this.readTypeHeader(type);
        this.readTypeBody(type);

        return type;
    }

    private readTypeHeader(type: PhpType): void {
        while (!this.eof()) {
            if (this.match(TokenType.Extends)) {
                type.extends = this.readQualifiedName();
                continue;
            }

            if (this.match(TokenType.Implements)) {
                type.implements = this.readNameList();
                continue;
            }

            if (this.match(TokenType.OpenBrace)) {
                return;
            }
            this.next();
        }
    }

    private readTypeBody(type: PhpType): void {
        const traits: string[] = [];
        let level = 1;
        while (!this.eof() && level > 0) {
            if (this.match(TokenType.OpenBrace)) {
                level++;
                continue;
            }

            if (this.match(TokenType.CloseBrace)) {
                level--;
                continue;
            }

            if (level === 1 && this.match(TokenType.Use)) {
                traits.push(...this.readNameList());
                this.match(TokenType.Semicolon);
                continue;
            }
            this.next();
        }
        type.traits = traits;
    }

    private isTypeKeyword(): boolean {
        return (
            this.tokenType() === TokenType.Class ||
            this.tokenType() === TokenType.Interface ||
            this.tokenType() === TokenType.Trait ||
            this.tokenType() === TokenType.Enum
        );
    }

    private mapKind(token: TokenType): PhpTypeKind {
        switch (token) {
            case TokenType.Interface:
                return PhpTypeKind.Interface;

            case TokenType.Trait:
                return PhpTypeKind.Trait;

            case TokenType.Enum:
                return PhpTypeKind.Enum;

            default:
                return PhpTypeKind.Class;
        }
    }
}