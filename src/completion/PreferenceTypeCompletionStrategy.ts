import * as vscode from "vscode";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { AbstractPhpTypeCompletionStrategy } from "./AbstractPhpTypeCompletionStrategy";

export class PreferenceTypeCompletionStrategy
    extends AbstractPhpTypeCompletionStrategy
{
    public readonly key = "preference:type";

    protected readonly phpKinds = [
        PhpTypeKind.Class
    ];

    protected readonly completionKind =
        vscode.CompletionItemKind.Class;

    protected readonly detail = "PHP Class";
}