import * as vscode from "vscode";

import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { AbstractPhpTypeCompletionStrategy } from "./AbstractPhpTypeCompletionStrategy";
import { XmlResolveResult } from "../xml/XmlResolver";

export class ItemObjectCompletionStrategy
    extends AbstractPhpTypeCompletionStrategy
{
    public readonly key = "item:value";

    protected readonly phpKinds = [
        PhpTypeKind.Class,
        PhpTypeKind.Interface
    ];

    protected readonly completionKind =
        vscode.CompletionItemKind.Class;

    protected readonly detail =
        "PHP Type";

    public override complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        xml: XmlResolveResult
    ): vscode.CompletionItem[]
    {
        if (xml.argumentType !== "object") {
            return [];
        }

        return super.complete(
            document,
            position,
            xml
        );
    }
}