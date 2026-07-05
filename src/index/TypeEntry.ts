import * as vscode from "vscode";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";

/**
 * Запис "індексу". Один запис у реєстрі (FQCN → місце у файлі)
 */
export interface TypeEntry 
{
    /**
     * Fully Qualified Class Name
     *
     * Example:
     * Magento\Framework\App\State
     */
    fqcn: string;

    kind: PhpTypeKind;

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