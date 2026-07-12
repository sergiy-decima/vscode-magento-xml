import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpReferenceList } from "./PhpReferenceList";
import { PhpMethod, PhpParameter } from "../ast/PhpType";
import { PhpReferenceKind } from "../ast/PhpReference";
import { TokenType } from "../lexer/TokenType";
import { PhpTypeNameParser } from "./PhpTypeNameParser";

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
    private readonly typeNameParser: PhpTypeNameParser;

    public constructor(
        stream: PhpTokenStream,
        private readonly references: PhpReferenceList
    ) {
        super(stream);
        this.typeNameParser = new PhpTypeNameParser(stream);
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
            // method.returnType = this.readReturnType();
            const parsed = this.typeNameParser.parse();
            if (parsed) {
                method.returnType = parsed.text;
                for (const name of parsed.names) {
                    this.references.add(
                        name,
                        parsed.offset,
                        parsed.length,
                        PhpReferenceKind.ReturnType
                    );
                }
            }
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
            // const type = this.readParameterType();
            let type: string | undefined;
            const parsed = this.typeNameParser.parse();
            if (parsed) {
                type = parsed.text;
                for (const name of parsed.names) {
                    this.references.add(
                        name,
                        parsed.offset,
                        parsed.length,
                        PhpReferenceKind.ParameterType
                    );
                }
            }

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