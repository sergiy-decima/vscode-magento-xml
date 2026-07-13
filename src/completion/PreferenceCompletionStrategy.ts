import * as vscode from "vscode";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { AbstractPhpTypeCompletionStrategy } from "./AbstractPhpTypeCompletionStrategy";

export class PreferenceCompletionStrategy
    extends AbstractPhpTypeCompletionStrategy
{
    public readonly key = "preference:for";

    protected readonly phpKinds = [
        PhpTypeKind.Interface
    ];

    protected readonly completionKind =
        vscode.CompletionItemKind.Interface;

    protected readonly detail = "PHP Interface";
}