import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class VirtualTypeTypeCompletionStrategy
    implements ICompletionStrategy
{
    public readonly key = "virtualType:type";

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
            .search(match.value, [PhpTypeKind.Class])
            .map(type => {

                const item = new vscode.CompletionItem(
                    type.fqcn,
                    vscode.CompletionItemKind.Class
                );

                item.insertText = type.fqcn;
                item.filterText = type.fqcn;
                item.sortText = type.fqcn;
                item.detail = "PHP Class";

                return item;

            });
    }
}