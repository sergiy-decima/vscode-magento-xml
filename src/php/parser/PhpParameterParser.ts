import { PhpParameter } from "../ast/PhpType";
import { TokenType } from "../lexer/TokenType";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";

/**
 * Parses PHP method parameters.
 *
 * Example:
 *
 * Foo $foo,
 * ?Bar $bar = null,
 * array $items = []
 */
export class PhpParameterParser extends PhpParserBase {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    public parse(): PhpParameter[] {
        const result: PhpParameter[] = [];
        while (!this.eof()) {
            if (this.match(TokenType.CloseParen)) {
                break;
            }

            const parameter = this.readParameter();
            if (parameter) {
                result.push(parameter);
            }

            if (this.match(TokenType.Comma)) {
                continue;
            }

            if (this.tokenType() === TokenType.CloseParen) {
                continue;
            }
            this.next();
        }

        return result;
    }

    private readParameter(): PhpParameter | undefined {
        let nullable = false;
        if (this.match(TokenType.Question)) {
            nullable = true;
        }

        let type: string | undefined;
        if (this.tokenType() === TokenType.Identifier) {
            type = this.readQualifiedName();
            if (nullable && type) {
                type = `?${type}`;
            }
        }

        if (this.tokenType() !== TokenType.Variable) {
            return undefined;
        }

        const variable = this.token();
        this.next();
        this.skipDefaultValue();

        return {
            name: variable.text.substring(1),
            type
        };
    }

    private skipDefaultValue(): void {
        if (!this.match(TokenType.Equals)) {
            return;
        }
        while (!this.eof()) {
            if (
                this.tokenType() === TokenType.Comma ||
                this.tokenType() === TokenType.CloseParen
            ) {
                return;
            }
            this.next();
        }
    }
}