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
        const typeList: PhpType[] = [];
        let namespace = "";
        while (lexer.scan() !== TokenType.EOF) {
            const token = lexer.tokenType();
            switch (token) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                case TokenType.Interface:
                case TokenType.Trait:
                case TokenType.Enum:
                    this.collectType(lexer, namespace, token, typeList);
                    break;
            }
        }

        return typeList;
    }

    public scanFirst(content: string): PhpType | undefined {
        const lexer = new PhpLexer(content);
        let namespace = "";
        let phpType: Partial<PhpType> | null = null;
        while (lexer.scan() !== TokenType.EOF) {
            const token = lexer.tokenType();
            switch (token) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                case TokenType.Interface:
                case TokenType.Trait:
                case TokenType.Enum:
                    phpType = this.readPhpType(lexer, namespace, token);
                    break;
            }

            if (phpType?.fqcn) {
                return phpType as PhpType;
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
     * Assamble php type and add one to type list
     * 
     * @param lexer 
     * @param namespace 
     * @param token 
     * @param typeList 
     */
    private collectType(
        lexer: PhpLexer,
        namespace: string,
        token: TokenType,
        typeList: PhpType[]
    ): void {
        const type = this.readPhpType(lexer, namespace, token);
        if (type) {
            typeList.push(type);
        }
    }

    /**
     * Assamble php type
     * 
     * @param lexer 
     * @param namespace 
     * @param token 
     * @returns 
     */
    private readPhpType(
        lexer: PhpLexer,
        namespace: string,
        token: TokenType
    ): PhpType | null {
        if (lexer.scan() !== TokenType.Identifier) {
            return null;
        }
        const keywordOffset = lexer.tokenOffset();
        const keywordLength = lexer.tokenLength();
        const shortName = lexer.tokenText();
        const fqcn = namespace ? `${namespace}\\${shortName}` : shortName;
        const kind = this.mapKind(token);

        const result: PhpType = {
            fqcn,
            namespace,
            shortName,
            kind,
            offset: keywordOffset,
            length: keywordLength + 1 + shortName.length,
            extends: undefined,
            implements: [],
            traits: []
        };

         // 🔥 PARSE inheritance chain
        let t = lexer.scan();
        while (t !== TokenType.EOF) {
            switch (t) {
                case TokenType.Extends:
                    result.extends = this.parseExtends(lexer);
                    break;

                case TokenType.Implements:
                    result.implements = this.parseImplements(lexer);
                    break;

                case TokenType.Use:
                    result.traits = this.parseTraits(lexer);
                    break;

                case TokenType.OpenBrace:
                    return result;
            }
            t = lexer.scan();
        }

        return result;
    }

    private mapKind(token: TokenType): PhpTypeKind {
        switch (token) {
            case TokenType.Class:
                return PhpTypeKind.Class;
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

    /**
     * helper
     *
     * @param lexer 
     * @returns 
     */
    private readTypeName(lexer: PhpLexer): string | undefined {
        const parts: string[] = [];
        while (lexer.scan() !== TokenType.EOF) {
            const token = lexer.tokenType();
            if (token === TokenType.Identifier) {
                parts.push(lexer.tokenText());
                continue;
            }

            if (token === TokenType.NamespaceSeparator) {
                parts.push("\\");
                continue;
            }

            // stop on structure boundary
            if (
                token === TokenType.Extends ||
                token === TokenType.Implements ||
                token === TokenType.Use ||
                token === TokenType.OpenBrace ||
                token === TokenType.Semicolon
            ) {
                break;
            }
            break;
        }

        return parts.length ? parts.join("") : undefined;
    }

    private readQualifiedName(lexer: PhpLexer): string | undefined {
        if (lexer.tokenType() !== TokenType.Identifier) {
            return;
        }

        let name = lexer.tokenText();
        while (lexer.scan() === TokenType.NamespaceSeparator) {
            if (lexer.scan() !== TokenType.Identifier) {
                break;
            }
            name += "\\" + lexer.tokenText();
        }

        return name;
    }

    /**
     * Парсинг extends
     *
     * @param lexer 
     * @returns 
     */
    private parseExtends(lexer: PhpLexer): string | undefined {
        const name = this.readQualifiedName(lexer);
        return name;
    }

    /**
     * Парсинг implements
     *
     * @param lexer 
     * @returns 
     */
    private parseImplements(lexer: PhpLexer): string[] {
        const result: string[] = [];

        // перший токен після implements
        if (lexer.scan() !== TokenType.Identifier) {
            return result;
        }

        while (true) {
            const name = this.readQualifiedName(lexer);
            if (name) {
                result.push(name);
            }

            switch (lexer.tokenType()) {
                case TokenType.Comma:
                    if (lexer.scan() !== TokenType.Identifier) {
                        return result;
                    }
                    continue;

                case TokenType.OpenBrace:
                    return result;

                default:
                    return result;
            }
        }
    }

    /**
     * Парсинг use (traits)
     *
     * @param lexer 
     * @returns 
     */
    private parseTraits(lexer: PhpLexer): string[] {
        const result: string[] = [];
        if (lexer.scan() !== TokenType.Identifier) {
            return result;
        }

        while (true) {
            const name = this.readQualifiedName(lexer);
            if (name) {
                result.push(name);
            }

            switch (lexer.tokenType()) {
                case TokenType.Comma:
                    if (lexer.scan() !== TokenType.Identifier) {
                        return result;
                    }
                    continue;

                case TokenType.Semicolon:
                    return result;

                default:
                    return result;
            }
        }
    }
}