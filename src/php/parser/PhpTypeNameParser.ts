import { PhpTypeName } from "../ast/PhpTypeName";
import { TokenType } from "../lexer/TokenType";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";

/**
 * Parses PHP type declarations.
 *
 * Supported:
 *
 * Foo
 * ?Foo
 * Foo|Bar
 * Foo&Bar
 * Foo|Bar&Baz
 */
export class PhpTypeNameParser extends PhpParserBase {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    public parse(): PhpTypeName | undefined {
        const start = this.tokenOffset();
        let text = "";
        const names: string[] = [];

        if (this.match(TokenType.Question)) {
            text += "?";
        }

        while (!this.eof()) {
            const name = this.readQualifiedName();
            if (!name) {
                break;
            }

            names.push(name);
            text += name;
            if (this.match(TokenType.Pipe)) {
                text += "|";
                continue;
            }

            if (this.match(TokenType.Ampersand)) {
                text += "&";
                continue;
            }
            break;
        }

        if (names.length === 0) {
            return;
        }

        return {
            text,
            names,
            offset: start,
            length: this.tokenOffset() - start
        };
    }
}