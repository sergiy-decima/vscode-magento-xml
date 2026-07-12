import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpReferenceList } from "./PhpReferenceList";
import { PhpMethod, PhpParameter } from "../ast/PhpType";
import { PhpReferenceKind } from "../ast/PhpReference";
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
 * {
 * }
 */
export class PhpMethodParser extends PhpParserBase {
    public constructor(
        stream: PhpTokenStream,
        private readonly references: PhpReferenceList
    ) {
        super(stream);
    }

    /**
     * Parse method after "function" keyword.
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
            parameters: [],
            returnType: undefined,
            offset: nameToken.offset,
            length: nameToken.length
        };
        this.next();

        /*
         * (
         *     ...
         * )
         */
        if (this.match(TokenType.OpenParen)) {
            method.parameters = this.readParameters();
        }

        // : Type
        if (this.match(TokenType.Colon)) {
            method.returnType = this.readReturnType();
        }
        method.length = this.token().offset - method.offset;

        return method;
    }

    /**
     * Reads parameter list.
     * (
     *     Foo $foo,
     *     int $id
     * )
     */
    private readParameters(): PhpParameter[] {
        const parameters: PhpParameter[] = [];
        while (!this.eof()) {
            // )
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
     * Reads parameter type.
     *
     * Foo
     * ?Foo
     * int
     */
    private readParameterType(): string | undefined {
        let nullable = false;
        if (this.match(TokenType.Question)) {
            nullable = true;
        }

        const typeToken = this.token();
        const type = this.readQualifiedName();
        if (!type) {
            return undefined;
        }

        this.references.add(
            type,
            typeToken.offset,
            typeToken.length,
            PhpReferenceKind.ParameterType
        );

        return nullable ? `?${type}` : type;
    }

    /**
     * Reads return type.
     */
    private readReturnType(): string | undefined {
        let nullable = false;
        if (this.match(TokenType.Question)) {
            nullable = true;
        }

        const typeToken = this.token();
        const type = this.readQualifiedName();
        if (!type) {
            return undefined;
        }

        this.references.add(
            type,
            typeToken.offset,
            typeToken.length,
            PhpReferenceKind.ReturnType
        );

        return nullable ? `?${type}` : type;
    }

    /**
     * Skip default parameter value.
     *
     * $id = 10
     * $foo = new Foo()
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