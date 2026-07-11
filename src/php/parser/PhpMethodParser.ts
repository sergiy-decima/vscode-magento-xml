import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpMethod, PhpParameter } from "../ast/PhpType";
import { TokenType } from "../lexer/TokenType";

/**
 * Parses PHP method declaration.
 *
 * Example:
 *
 * public function execute(
 *     LoggerInterface $logger,
 *     int $id
 * ): ResultInterface
 * protected static function create(): Foo {}
 */
export class PhpMethodParser extends PhpParserBase {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    /**
     * Parse method after "function" token.
     *
     * Current token:
     *
     * execute
     */
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

        /*
         * (
         *   parameters
         * )
         */
        if (this.match(TokenType.OpenParen)) {
            method.parameters = this.readParameters();
        }

        // : Type
        if (this.match(TokenType.Colon)) {
            method.returnType = this.readQualifiedName();
        }

        return method;
    }

    /**
     * Reads:
     *
     * (
     *     Foo $foo,
     *     int $id
     * )
     */
    private readParameters(): PhpParameter[] {
        const parameters: PhpParameter[] = [];
        while (!this.eof()) {
            /*
             * )
             */
            if (this.match(TokenType.CloseParen)) {
                break;
            }

            const type = this.readParameterType();
            if (this.tokenType() !== TokenType.Variable) {
                this.next();
                continue;
            }

            const variable = this.token();
            parameters.push({
                name: variable.text.substring(1),
                type,
                offset: variable.offset,
                length: variable.length
            });
            this.next();

            /*
             * default value:
             *
             * $id = 10
             *
             * Skip until:
             *
             * ,
             * )
             */
            this.skipDefaultValue();
            this.match(TokenType.Comma);
        }

        return parameters;
    }

    /**
     * Reads:
     *
     * ?Foo
     * Foo
     * int
     */
    private readParameterType(): string | undefined {
        let nullable = false;
        if (this.tokenType() === TokenType.Question) {
            nullable = true;
            this.next();
        }

        const type = this.readQualifiedName();
        if (!type) {
            return undefined;
        }

        return nullable ? `?${type}` : type;
    }

    /**
     * Skip:
     *
     * = defaultValue
     *
     * Example:
     *
     * $x = new Foo()
     */
    private skipDefaultValue(): void {
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