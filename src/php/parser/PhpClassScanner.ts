import { PhpLexer } from "../lexer/PhpLexer";
import { TokenType } from "../lexer/TokenType";
import { PhpSymbol } from "./PhpSymbol";

export class PhpClassScanner {
    public scan(content: string): PhpSymbol[] {
        const lexer = new PhpLexer(content);
        const result: PhpSymbol[] = [];
        let namespace = "";
        while (lexer.scan() !== TokenType.EOF) {
            switch (lexer.tokenType()) {
                case TokenType.Namespace:
                    namespace = this.readNamespace(lexer);
                    break;

                case TokenType.Class:
                case TokenType.Interface:
                case TokenType.Trait:
                case TokenType.Enum: {
                    const symbol = this.readClass(lexer, namespace);
                    if (symbol) {
                        result.push(symbol);
                    }
                    break;
                }
            }
        }

        return result;
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

    private readClass(lexer: PhpLexer, namespace: string): PhpSymbol | undefined {
        if (lexer.scan() !== TokenType.Identifier) {
            return;
        }

        const shortName = lexer.tokenText();

        return {
            fqcn: namespace ? `${namespace}\\${shortName}` : shortName,
            namespace,
            shortName
        };
    }
}