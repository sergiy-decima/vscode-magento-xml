import { PhpToken } from "../lexer/PhpToken";
import { PhpSymbolKind } from "./PhpSymbolKind";

export interface PhpSymbol
{
    kind: PhpSymbolKind;

    token: PhpToken;

    className?: string;

    memberName?: string;
}