import { TokenType } from "../lexer/TokenType";
import { PhpType } from "../ast/PhpType";
import { PhpTypeKind } from "../ast/PhpTypeKind";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpClassBodyParser } from "./PhpClassBodyParser";

/**
 * PHP type parser. Finds PHP types:
 * - namespace
 * - class
 * - interface
 * - trait
 * - enum
 * - extends
 * - implements
 * - trait usage
 */
export class PhpTypeParser extends PhpParserBase
{
    constructor(stream: PhpTokenStream) {
        super(stream);
    }

    /**
     * Parses a single type declaration.
     *
     * Returns undefined if current token is not a type keyword.
     */
    public parseType(namespace: string): PhpType | undefined {
        if (!this.isTypeKeyword()) {
            return undefined;
        }

        return this.readPhpType(namespace, this.tokenType());
    }

    private readPhpType(namespace: string, keyword: TokenType): PhpType | undefined {
        this.next();
        if (this.tokenType() !== TokenType.Identifier) {
            return undefined;
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
            traits: [],
            properties: [],
            methods: []
        };
        this.next();
        this.readTypeHeader(type);

        const bodyParser = new PhpClassBodyParser(this.stream);
        bodyParser.parse(type);

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

    protected isTypeKeyword(): boolean {
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