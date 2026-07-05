import * as vscode from "vscode";
import { PhpSymbolKind } from "../php/parser/PhpSymbol"

export interface IndexedClass 
{
    /**
     * Fully Qualified Class Name
     *
     * Example:
     * Magento\Framework\App\State
     */
    fqcn: string;

    kind: PhpSymbolKind;

    uri: vscode.Uri;

    /**
     * Offset всередині файлу.
     */
    offset: number;

    /**
     * Довжина токена class/interface/trait => 21
     */
    length: number;
}