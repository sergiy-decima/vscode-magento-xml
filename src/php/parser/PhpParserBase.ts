import { PhpLexer } from "../lexer/PhpLexer";
import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";

/**
 * Base helper for PHP parsers.
 *
 * Не будує AST.
 * Дає базові операції для scanner/parser класів.
 */
export abstract class PhpParserBase {
    protected readonly lexer: PhpLexer;
    private current: PhpToken;

    constructor(context: string) {
        this.lexer = new PhpLexer(context);
        this.current = this.readNext();
    }

    /**
     * Поточний токен
     */
    protected token(): Readonly<PhpToken> {
        return this.current;
    }

    /**
     * Тип поточного токена
     */
    protected tokenType(): TokenType {
        return this.current.type;
    }

    /**
     * Текст поточного токена
     */
    protected tokenText(): string {
        return this.current.text;
    }

    /**
     * Перехід на наступний токен
     */
    protected next(): void {
        this.current = this.readNext();
    }

    /**
     * Перевірити і перейти далі
     */
    protected match(type: TokenType): boolean {
        if (this.current.type !== type) {
            return false;
        }
        this.next();

        return true;
    }

    /**
     * Очікуємо конкретний токен.
     */
    protected expect(type: TokenType): PhpToken {
        if (this.current.type !== type) {
            throw new Error(
                `Expected ${TokenType[type]}, got ${TokenType[this.current.type]}`
            );
        }
        const token = this.current;
        this.next();

        return token;
    }

    /**
     * Кінець файлу?
     */
    protected eof(): boolean {
        return this.current.type === TokenType.EOF;
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

    /**
     * Lexer wrapper.
     */
    private readNext(): PhpToken {
        this.lexer.scan();
        return this.lexer.token();
    }
}