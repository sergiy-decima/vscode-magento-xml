import { PhpLexer } from "../lexer/PhpLexer";
import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";

/**
 * Buffered token stream over PhpLexer.
 *
 * Scanner працює тільки з ним,
 * а не напряму з PhpLexer.
 */
export class PhpTokenStream {
    private current: PhpToken;

    constructor(private readonly lexer: PhpLexer) {
        this.current = this.read();
    }

    /**
     * Поточний токен
     */
    public token(): Readonly<PhpToken> {
        return this.current;
    }

    /**
     * Тип поточного токена
     */
    public tokenType(): TokenType {
        return this.current.type;
    }

    /**
     * Перейти до наступного токена
     */
    public next(): TokenType {
        this.current = this.read();
        return this.current.type;
    }

    /**
     * Якщо поточний токен потрібного типу —
     * перейти до наступного.
     */
    public match(type: TokenType): boolean {
        if (this.current.type !== type) {
            return false;
        }
        this.next();

        return true;
    }

    /**
     * Поточний токен має бути заданого типу.
     */
    public expect(type: TokenType): PhpToken {
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
     * EOF?
     */
    public eof(): boolean {
        return this.current.type === TokenType.EOF;
    }

    private read(): PhpToken {
        this.lexer.scan();
        return this.lexer.token();
    }
}