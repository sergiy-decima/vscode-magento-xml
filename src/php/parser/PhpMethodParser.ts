import { PhpMethod } from "../ast/PhpType";
import { TokenType } from "../lexer/TokenType";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";

/**
 * Parses PHP method declaration.
 *
 * Example:
 *
 * public function execute(): void {}
 * protected static function create(): Foo {}
 */
export class PhpMethodParser extends PhpParserBase {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    public parse(
        visibility: "public" | "protected" | "private",
        isStatic: boolean
    ): PhpMethod | undefined {
        if (this.tokenType() !== TokenType.Identifier) {
            return undefined;
        }

        const nameToken = this.token();
        const method: PhpMethod = {
            name: nameToken.text,
            visibility,
            isStatic,
            offset: nameToken.offset,
            length: nameToken.length,
            parameters: [],
            returnType: undefined
        };
        this.next();

        // (
        if (!this.match(TokenType.OpenParen)) {
            return method;
        }
        this.skipParameterList();

        // : Type
        if (this.match(TokenType.Colon)) {
            method.returnType = this.readType();
        }

        return method;
    }

    private readType(): string | undefined {
        let nullable = false;
        if (this.match(TokenType.Question)) {
            nullable = true;
        }

        const type = this.readQualifiedName();
        if (!type) {
            return undefined;
        }

        return nullable ? `?${type}` : type;
    }

    private skipParameterList(): void {
        let level = 1;
        while (!this.eof() && level > 0) {
            if (this.match(TokenType.OpenParen)) {
                level++;
                continue;
            }

            if (this.match(TokenType.CloseParen)) {
                level--;
                continue;
            }
            this.next();
        }
    }
}