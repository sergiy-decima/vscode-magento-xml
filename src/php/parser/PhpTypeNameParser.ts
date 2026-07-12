import { TokenType } from "../lexer/TokenType";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";

/**
 * Parses PHP type declarations.
 *
 * Supports:
 *
 * Foo
 * ?Foo
 * Foo|Bar
 * Foo&Bar
 * Foo|null
 * (пізніше можна додати callable, array<int>, Closure(A):B тощо)
 */
export class PhpTypeNameParser extends PhpParserBase {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    /**
     * Reads a PHP type declaration.
     */
    public parse(): string | undefined {
        let nullable = false;
        if (this.match(TokenType.Question)) {
            nullable = true;
        }

        const parts: string[] = [];
        const first = this.readTypePart();
        if (!first) {
            return undefined;
        }

        parts.push(first);
        while (true) {
            if (this.match(TokenType.Pipe)) {
                const next = this.readTypePart();
                if (!next) {
                    break;
                }
                parts.push("|");
                parts.push(next);
                continue;
            }

            if (this.match(TokenType.Ampersand)) {
                const next = this.readTypePart();
                if (!next) {
                    break;
                }
                parts.push("&");
                parts.push(next);
                continue;
            }
            break;
        }
        const type = parts.join("");

        return nullable ? `?${type}` : type;
    }

    private readTypePart(): string | undefined {
        if (
            this.tokenType() === TokenType.Static
        ) {
            const value = this.tokenText();
            this.next();
            return value;
        }

        return this.readQualifiedName();
    }
}