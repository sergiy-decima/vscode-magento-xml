import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpType } from "../ast/PhpType";
import { TokenType } from "../lexer/TokenType";

/**
 * Parses class/interface/trait/enum body.
 *
 * {
 *     use ...
 *     private ...
 *     public function ...
 * }
 */
export class PhpClassBodyParser extends PhpParserBase {
    public constructor(stream: PhpTokenStream) {
        super(stream);
    }

    /**
     * Parse type body.
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

            if (level !== 1) {
                this.next();
                continue;
            }

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
        this.skipUntilSemicolonOrBlock();
    }

    private readProperty(
        type: PhpType,
        visibility: "public" | "protected" | "private",
        isStatic: boolean,
        isReadonly: boolean
    ): void {
        const propertyType = this.readPropertyType();
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

    private readPropertyType(): string | undefined {
        let nullable = false;
        if (this.tokenType() === TokenType.Unknown && this.tokenText() === "?") {
            nullable = true;
            this.next();
        }

        const type = this.readQualifiedName();
        if (!type) {
            return undefined;
        }

        return nullable ? `?${type}` : type;
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