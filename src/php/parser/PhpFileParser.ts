import { PhpFile } from "../ast/PhpFile";
import { PhpImport } from "../ast/PhpImport";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpTypeParser } from "./PhpTypeParser";
import { TokenType } from "../lexer/TokenType";

/**
 * Parses a complete PHP file.
 */
export class PhpFileParser extends PhpTypeParser {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    /**
     * Parses entire PHP file.
     */
    public parse(): PhpFile {
        const file: PhpFile = {
            namespace: undefined,
            imports: [],
            types: []
        };

        while (!this.eof()) {
            if (this.match(TokenType.Namespace)) {
                file.namespace = this.readNamespace();
                continue;
            }

            if (this.match(TokenType.Use)) {
                file.imports.push(this.readImport());
                continue;
            }

            if (this.isTypeKeyword()) {
                const type = this.parseType(file.namespace ?? "");
                if (type) {
                    file.types.push(type);
                }
                continue;
            }
            this.next();
        }

        return file;
    }

    /**
     * Reads namespace declaration.
     */
    protected readNamespace(): string {
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

    /**
     * Reads a single import.
     *
     * use Magento\Framework\App\State;
     * use Magento\Framework\App\State as AppState;
     */
    private readImport(): PhpImport {
        const fqcn = this.readQualifiedName() ?? "";
        let alias = fqcn.split("\\").pop() ?? fqcn;
        if (this.match(TokenType.As)) {
            if (this.tokenType() === TokenType.Identifier) {
                alias = this.tokenText();
                this.next();
            }
        }
        this.match(TokenType.Semicolon);

        return {fqcn, alias};
    }
}