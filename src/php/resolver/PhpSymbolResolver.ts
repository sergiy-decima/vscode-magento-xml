import { PhpFile } from "../ast/PhpFile";
import { PhpToken } from "../lexer/PhpToken";
import { PhpSymbol } from "../symbol/PhpSymbol";
import { PhpSymbolKind } from "../symbol/PhpSymbolKind";

export class PhpSymbolResolver
{
    public resolve(
        phpFile: PhpFile,
        token: PhpToken
    ): PhpSymbol | undefined
    {
        //
        // TODO:
        // method
        // property
        // constant
        //

        return {
            kind: PhpSymbolKind.Class,
            token
        };
    }
}