import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";
import { PhpTokenStream } from "./PhpTokenStream";

/**
 * Base helper for PHP parsers.
 *
 * Не будує AST.
 * Дає базові операції для scanner/parser класів.
 */
export abstract class PhpParserBase {
    protected readonly stream: PhpTokenStream;

    constructor(stream: PhpTokenStream) {
        this.stream = stream;
    }

    /**
     * Поточний токен
     */
    protected token(): Readonly<PhpToken> {
        return this.stream.token();
    }

    /**
     * Тип поточного токена
     */
    protected tokenType(): TokenType {
        return this.stream.tokenType();
    }

    /**
     * Текст поточного токена
     */
    protected tokenText(): string {
        return this.stream.token().text;
    }

    /**
     * Зсув від початку джерела.
     */
    protected tokenOffset(): number {
        return this.stream.token().offset;
    }

    /**
     * Перехід на наступний токен
     */
    protected next(): void {
        this.stream.next();
    }

    /**
     * Перевірити і перейти далі
     */
    protected match(type: TokenType): boolean {
        return this.stream.match(type);
    }

    /**
     * Очікуємо конкретний токен.
     */
    protected expect(type: TokenType): PhpToken {
        return this.stream.expect(type);
    }

    /**
     * Кінець файлу?
     */
    protected eof(): boolean {
        return this.stream.eof();
    }

    /**
     * Читає:
     *
     * Magento\Framework\App\State
     *
     */
    protected readQualifiedName(): string | undefined {
        if (this.tokenType() !== TokenType.Identifier) {
            return undefined;
        }

        const parts: string[] = [];
        parts.push(this.tokenText());
        this.next();

        while (this.match(TokenType.NamespaceSeparator)) {
            if (this.tokenType() !== TokenType.Identifier) {
                break;
            }
            parts.push(this.tokenText());
            this.next();
        }

        return parts.join("\\");
    }

    /**
     * Читає список:
     *
     * A, B, C
     *
     */
    protected readNameList(): string[] {
        const result: string[] = [];
        while (!this.eof()) {
            const name = this.readQualifiedName();
            if (name) {
                result.push(name);
            }

            if (!this.match(TokenType.Comma)) {
                break;
            }
        }

        return result;
    }

    /**
     * Пропускає блок:
     *
     * {
     *    ...
     * }
     *
     */
    protected skipBlock(): void {
        if (!this.match(TokenType.OpenBrace)) {
            return;
        }

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
            this.next();
        }
    }
}