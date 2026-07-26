import { PhpFile } from "../ast/PhpFile";
import { PhpToken } from "../lexer/PhpToken";
import { TokenType } from "../lexer/TokenType";
import { PhpSymbol } from "../symbol/PhpSymbol";
import { PhpSymbolKind } from "../symbol/PhpSymbolKind";

export class PhpSymbolResolver
{
    public resolve(
        phpFile: PhpFile,
        token: PhpToken
    ): PhpSymbol | undefined
    {
        switch (token.type) {

            case TokenType.Identifier:
                return this.resolveIdentifier(
                    phpFile,
                    token
                );

            case TokenType.Variable:
                return this.resolveVariable(
                    phpFile,
                    token
                );
        }

        return undefined;
    }

    private resolveIdentifier(
        phpFile: PhpFile,
        token: PhpToken
    ): PhpSymbol | undefined
    {
        return {
            kind: PhpSymbolKind.Class,
            token
        };
    }

    private resolveVariable(
        phpFile: PhpFile,
        token: PhpToken
    ): PhpSymbol | undefined
    {
        return {
            kind: PhpSymbolKind.Variable,
            token
        };
    }
}