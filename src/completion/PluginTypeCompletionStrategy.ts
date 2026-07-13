import * as vscode from "vscode";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { AbstractPhpTypeCompletionStrategy } from "./AbstractPhpTypeCompletionStrategy";

export class PluginTypeCompletionStrategy
    extends AbstractPhpTypeCompletionStrategy
{
    public readonly key = "plugin:type";

    protected readonly phpKinds = [
        PhpTypeKind.Class,
        PhpTypeKind.Interface
    ];

    protected readonly completionKind =
        vscode.CompletionItemKind.Class;

    protected readonly detail = "PHP Type";
}