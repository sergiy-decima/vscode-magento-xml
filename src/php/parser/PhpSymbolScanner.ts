import * as fs from "node:fs/promises";
import { PhpLexer } from "../lexer/PhpLexer";
import { TokenType } from "../lexer/TokenType";
import { PhpType } from "../ast/PhpType";
import { PhpTypeKind } from "../ast/PhpTypeKind";

export interface PhpScannerInterface {
    scanFile(file: string): Promise<PhpType[]>;
    scanFirstFile(file: string): Promise<PhpType | undefined>;
    scan(content: string): PhpType[];
    scanFirst(content: string): PhpType | undefined;
}

/**
 * швидке виділення символів
 */
export class PhpSymbolScanner implements PhpScannerInterface {
    public async scanFile(file: string): Promise<PhpType[]> {
        const content = await fs.readFile(file, "utf8");
        return this.scan(content);
    }

    public async scanFirstFile(file: string): Promise<PhpType | undefined> {
        const content = await fs.readFile(file, "utf8");
        return this.scanFirst(content);
    }

    public scan(content: string): PhpType[] {
        const lexer = new PhpLexer(content);
        const symbols: PhpType[] = [];
        let namespace = "";
        while (lexer.scan() !== TokenType.EOF) {
            switch (lexer.tokenType()) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                    this.readDeclaration(lexer, namespace, PhpTypeKind.Class, symbols);
                    break;

                case TokenType.Interface:
                    this.readDeclaration(lexer, namespace, PhpTypeKind.Interface, symbols);
                    break;

                case TokenType.Trait:
                    this.readDeclaration(lexer, namespace, PhpTypeKind.Trait, symbols);
                    break;

                case TokenType.Enum:
                    this.readDeclaration(lexer, namespace, PhpTypeKind.Enum, symbols);
                    break;
            }
        }

        return symbols;
    }

    public scanFirst(content: string): PhpType | undefined {
        const lexer = new PhpLexer(content);
        let namespace = "";
        while (lexer.scan() !== TokenType.EOF) {
            switch (lexer.tokenType()) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                    return this.readSingleDeclaration(lexer, namespace, PhpTypeKind.Class);

                case TokenType.Interface:
                    return this.readSingleDeclaration(lexer, namespace, PhpTypeKind.Interface);

                case TokenType.Trait:
                    return this.readSingleDeclaration(lexer, namespace, PhpTypeKind.Trait);

                case TokenType.Enum:
                    return this.readSingleDeclaration(lexer, namespace, PhpTypeKind.Enum);
            }
        }

        return undefined;
    }

    private readNamespace(lexer: PhpLexer): string {
        const parts: string[] = [];
        while (lexer.scan() !== TokenType.EOF) {
            switch (lexer.tokenType()) {
                case TokenType.Identifier:
                    parts.push(lexer.tokenText());
                    break;

                case TokenType.NamespaceSeparator:
                    break;

                case TokenType.Semicolon:
                case TokenType.OpenBrace:
                    return parts.join("\\");

                default:
                    return "";
            }
        }

        return "";
    }

    /**
     * @todo rename readPhpSymbol
     */
    private readDeclaration(
        lexer: PhpLexer,
        namespace: string,
        kind: PhpTypeKind,
        result: PhpType[]
    ): void {
        const symbol = this.readSingleDeclaration(lexer, namespace, kind);
        if (symbol) {
            result.push(symbol);
        }
    }

    /**
     * @todo rename createPhpSymbol
     */
    private readSingleDeclaration(
        lexer: PhpLexer,
        namespace: string,
        kind: PhpTypeKind,
    ): PhpType | undefined {
        const keywordOffset = lexer.tokenOffset();
        const keywordLength = lexer.tokenLength();
        if (lexer.scan() !== TokenType.Identifier) {
            return;
        }
        const shortName = lexer.tokenText();

        return {
            fqcn: namespace ? `${namespace}\\${shortName}` : shortName,
            namespace,
            shortName,
            kind,
            offset: keywordOffset,
            length: keywordLength + 1 + shortName.length,
            implements: [],
            traits: []
        };
    }
}