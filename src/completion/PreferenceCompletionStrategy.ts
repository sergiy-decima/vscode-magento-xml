import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class PreferenceCompletionStrategy
    implements ICompletionStrategy
{
    public readonly key = "preference:for";

    constructor(
        private registry: TypeRegistry
    ) {}

    public complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        match: XmlAttributeMatch
    ): vscode.CompletionItem[]
    {
        return this.registry
            .search(match.value, [PhpTypeKind.Interface])
            .map(type => {

                const item = new vscode.CompletionItem(
                    type.fqcn,
                    vscode.CompletionItemKind.Interface
                );

                item.insertText = type.fqcn;
                item.filterText = type.fqcn;
                item.sortText = type.fqcn;
                item.detail = "PHP Interface";

                return item;

            });
    }
}