import * as vscode from "vscode";

import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { AbstractPhpTypeCompletionStrategy } from "./AbstractPhpTypeCompletionStrategy";
import { XmlResolveResult } from "../xml/XmlResolver";

export class ArgumentObjectCompletionStrategy
    extends AbstractPhpTypeCompletionStrategy
{
    public readonly key = "argument:value";

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
        if (
            xml.node?.attribute("xsi:type")?.value !== "object"
        ) {
            return [];
        }

        return super.complete(
            document,
            position,
            xml
        );
    }
}