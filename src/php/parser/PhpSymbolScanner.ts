import * as fs from "node:fs/promises";
import { PhpLexer } from "../lexer/PhpLexer";
import { TokenType } from "../lexer/TokenType";
import { PhpSymbol, PhpSymbolKind } from "./PhpSymbol";

export interface PhpScannerInterface {
    scanFile(file: string): Promise<PhpSymbol[]>;
    scanFirstFile(file: string): Promise<PhpSymbol | undefined>;
    scan(content: string): PhpSymbol[];
    scanFirst(content: string): PhpSymbol | undefined;
}

/**
 * швидке виділення символів
 */
export class PhpSymbolScanner implements PhpScannerInterface {
    public async scanFile(file: string): Promise<PhpSymbol[]> {
        const content = await fs.readFile(file, "utf8");
        return this.scan(content);
    }

    public async scanFirstFile(file: string): Promise<PhpSymbol | undefined> {
        const content = await fs.readFile(file, "utf8");
        return this.scanFirst(content);
    }

    public scan(content: string): PhpSymbol[] {
        const lexer = new PhpLexer(content);
        const symbols: PhpSymbol[] = [];
        let namespace = "";
        while (lexer.scan() !== TokenType.EOF) {
            switch (lexer.tokenType()) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                    this.readDeclaration(lexer, namespace, PhpSymbolKind.Class, symbols);
                    break;

                case TokenType.Interface:
                    this.readDeclaration(lexer, namespace, PhpSymbolKind.Interface, symbols);
                    break;

                case TokenType.Trait:
                    this.readDeclaration(lexer, namespace, PhpSymbolKind.Trait, symbols);
                    break;

                case TokenType.Enum:
                    this.readDeclaration(lexer, namespace, PhpSymbolKind.Enum, symbols);
                    break;
            }
        }

        return symbols;
    }

    public scanFirst(content: string): PhpSymbol | undefined {
        const lexer = new PhpLexer(content);
        let namespace = "";
        while (lexer.scan() !== TokenType.EOF) {
            switch (lexer.tokenType()) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                    return this.readSingleDeclaration(lexer, namespace, PhpSymbolKind.Class);

                case TokenType.Interface:
                    return this.readSingleDeclaration(lexer, namespace, PhpSymbolKind.Interface);

                case TokenType.Trait:
                    return this.readSingleDeclaration(lexer, namespace, PhpSymbolKind.Trait);

                case TokenType.Enum:
                    return this.readSingleDeclaration(lexer, namespace, PhpSymbolKind.Enum);
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
        kind: PhpSymbolKind,
        result: PhpSymbol[]
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
        kind: PhpSymbolKind,
    ): PhpSymbol | undefined {
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
            length: keywordLength + 1 + shortName.length
        };
    }
}