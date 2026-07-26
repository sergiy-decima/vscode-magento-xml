import { PhpConstant } from "../ast/PhpType";
import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { TokenType } from "../lexer/TokenType";

export class PhpConstantParser extends PhpParserBase
{
    public constructor(
        stream: PhpTokenStream
    ) {
        super(stream);
    }

    public parse(): PhpConstant | undefined
    {
        if (
            this.tokenType() !== TokenType.Identifier
        ) {
            return;
        }

        const token = this.token();

        const constant: PhpConstant = {
            name: token.text,
            offset: token.offset,
            length: token.length
        };

        while (!this.eof()) {

            if (this.match(TokenType.Semicolon)) {
                break;
            }

            this.next();
        }

        return constant;
    }
}