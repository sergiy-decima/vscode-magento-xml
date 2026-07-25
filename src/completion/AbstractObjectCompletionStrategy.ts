import * as vscode from "vscode";

import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlResolveResult } from "../xml/XmlResolver";
import { AbstractPhpTypeCompletionStrategy } from "./AbstractPhpTypeCompletionStrategy";

export abstract class AbstractObjectCompletionStrategy
    extends AbstractPhpTypeCompletionStrategy
{
    protected readonly phpKinds = [
        PhpTypeKind.Class,
        PhpTypeKind.Interface
    ];

    protected readonly completionKind =
        vscode.CompletionItemKind.Class;

    protected readonly detail =
        "PHP Type";

    protected supports(
        xml: XmlResolveResult
    ): boolean
    {
        return xml.argumentType === "object";
    }

    public override complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        xml: XmlResolveResult
    ): vscode.CompletionItem[]
    {
        if (!this.supports(xml)) {
            return [];
        }

        return super.complete(
            document,
            position,
            xml
        );
    }
}