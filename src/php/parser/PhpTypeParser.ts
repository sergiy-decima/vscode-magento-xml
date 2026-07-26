import { PhpType } from "../ast/PhpType";
import { PhpTypeKind } from "../ast/PhpTypeKind";
import { TokenType } from "../lexer/TokenType";
import { PhpReferenceList } from "./PhpReferenceList";
import { PhpClassBodyParser } from "./PhpClassBodyParser";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpImport } from "../ast/PhpImport";

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
    public parseType(
        namespace: string,
        imports: readonly PhpImport[]
    ): PhpType | undefined
    {
        if (!this.isTypeKeyword()) {
            return undefined;
        }

        return this.readPhpType(
            namespace,
            imports,
            this.tokenType()
        );
    }

    /**
     * Reads:
     *
     * class Foo extends Bar implements Baz
     */
    private readPhpType(
        namespace: string,
        imports: readonly PhpImport[],
        keyword: TokenType
    ): PhpType | undefined
    {
        this.next();

        if (this.tokenType() !== TokenType.Identifier) {
            return undefined;
        }

        const nameToken = this.token();

        const shortName = nameToken.text;

        const fqcn =
            namespace
                ? `${namespace}\\${shortName}`
                : shortName;

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
            constants: [],
            methods: []
        };

        this.next();

        this.readTypeHeader(
            type,
            namespace,
            imports
        );

        this.bodyParser.parse(type);

        return type;
    }

    /**
     * Reads:
     *
     * extends Foo
     * implements A, B
     */
    private readTypeHeader(
        type: PhpType,
        namespace: string,
        imports: readonly PhpImport[]
    ): void
    {
        while (!this.eof()) {

            if (this.match(TokenType.Extends)) {

                const name = this.readQualifiedName();

                if (name) {
                    type.extends = this.resolveType(
                        name,
                        namespace,
                        imports
                    );
                }

                continue;
            }

            if (this.match(TokenType.Implements)) {

                type.implements = this.readNameList().map(
                    name => this.resolveType(
                        name,
                        namespace,
                        imports
                    )
                );

                continue;
            }

            if (this.match(TokenType.OpenBrace)) {
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

    private resolveType(
        name: string,
        namespace: string,
        imports: readonly PhpImport[]
    ): string
    {
        //
        // Fully-qualified
        //
        if (name.startsWith("\\")) {
            return name.substring(1);
        }

        //
        // Imported alias
        //
        for (const useImport of imports) {

            if (useImport.alias === name) {
                return useImport.fqcn;
            }

        }

        //
        // Already qualified inside current namespace
        //
        if (name.includes("\\")) {
            return `${namespace}\\${name}`;
        }

        //
        // Same namespace
        //
        return `${namespace}\\${name}`;
    }
}