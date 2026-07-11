import { PhpType } from "../ast/PhpType";
import { PhpTypeKind } from "../ast/PhpTypeKind";
import { TokenType } from "../lexer/TokenType";
import { PhpReferenceList } from "./PhpReferenceList";
import { PhpClassBodyParser } from "./PhpClassBodyParser";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";

/**
 * Parses PHP type declarations:
 *
 * class
 * interface
 * trait
 * enum
 *
 * Handles:
 * - extends
 * - implements
 * - class body
 */
export class PhpTypeParser extends PhpParserBase {
    private readonly bodyParser: PhpClassBodyParser;

    public constructor(
        stream: PhpTokenStream,
        references: PhpReferenceList
    ) {
        super(stream);
        this.bodyParser = new PhpClassBodyParser(stream, references);
    }

    /**
     * Current token is a type keyword.
     */
    public isTypeKeyword(): boolean {
        return (
            this.tokenType() === TokenType.Class ||
            this.tokenType() === TokenType.Interface ||
            this.tokenType() === TokenType.Trait ||
            this.tokenType() === TokenType.Enum
        );
    }

    /**
     * Parses one type declaration.
     * 
     * Returns undefined if current token is not a type keyword.
     */
    public parseType(namespace: string): PhpType | undefined {
        if (!this.isTypeKeyword()) {
            return undefined;
        }

        return this.readPhpType(namespace, this.tokenType());
    }

    /**
     * Reads:
     *
     * class Foo extends Bar implements Baz
     */
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
        this.bodyParser.parse(type);

        return type;
    }

    /**
     * Reads:
     *
     * extends Foo
     * implements A, B
     */
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
                /*
                 * Body parser expects to start
                 * inside the body.
                 */
                return;
            }
            this.next();
        }
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