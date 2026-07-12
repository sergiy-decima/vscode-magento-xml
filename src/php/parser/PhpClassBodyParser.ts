import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpReferenceList } from "./PhpReferenceList";
import { PhpType } from "../ast/PhpType";
import { TokenType } from "../lexer/TokenType";
import { PhpMethodParser } from "./PhpMethodParser";
import { PhpReferenceKind } from "../ast/PhpReference";
import { PhpTypeNameParser } from "./PhpTypeNameParser";
import { PhpMethodBodyParser } from "./PhpMethodBodyParser";

/**
 * Parses class/interface/trait/enum body.
 * 
 * Example:
 * {
 *     use SomeTrait;
 *
 *     private string $name;
 *
 *     public function execute()
 *     {
 *     }
 * }
 */
export class PhpClassBodyParser extends PhpParserBase {
    private readonly typeNameParser: PhpTypeNameParser;

    public constructor(
        stream: PhpTokenStream,
        private readonly references: PhpReferenceList
    ) {
        super(stream);
        this.typeNameParser = new PhpTypeNameParser(stream);
    }

    /**
     * Parse body.
     *
     * Parser starts after opening "{"
     */
    public parse(type: PhpType): void {
        let level = 1;
        while (!this.eof() && level > 0) {
            if (this.match(TokenType.OpenBrace)) {
                level++;
                continue;
            }

            if (this.match(TokenType.CloseBrace)) {
                level--;
                continue;
            }

            /*
             * Nested blocks:
             *
             * function foo()
             * {
             *     ...
             * }
             */
            if (level !== 1) {
                this.next();
                continue;
            }

            /*
             * Trait usage:
             *
             * use Vendor\TraitName;
             */
            if (this.match(TokenType.Use)) {
                type.traits.push(...this.readNameList());
                this.match(TokenType.Semicolon);
                continue;
            }

            if (
                this.tokenType() === TokenType.Abstract ||
                this.tokenType() === TokenType.Final ||
                this.tokenType() === TokenType.Readonly
            ) {
                this.next();
                continue;
            }

            /*
             * Class member:
             *
             * public $x;
             * private function foo()
             */
            if (this.isVisibility()) {
                this.readMember(type);
                continue;
            }
            this.next();
        }
    }

    private isVisibility(): boolean {
        return (
            this.tokenType() === TokenType.Public ||
            this.tokenType() === TokenType.Protected ||
            this.tokenType() === TokenType.Private
        );
    }

    private readVisibility(): "public" | "protected" | "private" {
        switch (this.tokenType()) {
            case TokenType.Public:
                this.next();
                return "public";

            case TokenType.Protected:
                this.next();
                return "protected";

            default:
                this.next();
                return "private";
        }
    }

    private readMember(type: PhpType): void {
        const visibility = this.readVisibility();
        let isStatic = false;
        let isReadonly = false;
        while (true) {
            if (this.match(TokenType.Static)) {
                isStatic = true;
                continue;
            }

            if (this.match(TokenType.Readonly)) {
                isReadonly = true;
                continue;
            }
            break;
        }

        if (this.match(TokenType.Function)) {
            this.readMethod(type, visibility, isStatic);
            return;
        }

        this.readProperty(type, visibility, isStatic, isReadonly);
    }

    private readMethod(
        type: PhpType,
        visibility: "public" | "protected" | "private",
        isStatic: boolean
    ): void {
        const parser = new PhpMethodParser(this.stream, this.references);
        const method = parser.parse(visibility, isStatic);
        if (method) {
            type.methods.push(method);
        }

        /*
        * Після парсингу сигнатури
        *
        * поточний токен:
        * {
        *     ...
        * }
        * або
        * ;
        */
        if (this.tokenType() === TokenType.OpenBrace) {
            const bodyParser = new PhpMethodBodyParser(this.stream, this.references);
            bodyParser.parse();
        }
    }

    private readProperty(
        type: PhpType,
        visibility: "public" | "protected" | "private",
        isStatic: boolean,
        isReadonly: boolean
    ): void {
        let propertyType: string | undefined;
        const typeOffset = this.token().offset;
        const parsed = this.typeNameParser.parse();
        if (parsed) {
            propertyType = parsed;
            this.references.add(
                parsed.replace(/^\?/, ""),
                typeOffset,
                parsed.length,
                PhpReferenceKind.PropertyType
            );
        }

        if (this.tokenType() !== TokenType.Variable) {
            this.skipUntilSemicolonOrBlock();
            return;
        }

        const variable = this.token();
        type.properties.push({
            name: variable.text.substring(1),
            type: propertyType,
            visibility,
            isStatic,
            isReadonly,
            offset: variable.offset,
            length: variable.length
        });

        while (!this.eof()) {
            if (this.match(TokenType.Semicolon)) {
                return;
            }
            this.next();
        }
    }

    private skipUntilSemicolonOrBlock(): void {
        while (!this.eof()) {
            if (this.match(TokenType.Semicolon)) {
                return;
            }

            if (this.tokenType() === TokenType.OpenBrace) {
                this.skipBlock();
                return;
            }
            this.next();
        }
    }
}