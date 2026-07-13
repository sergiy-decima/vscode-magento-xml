import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class PreferenceCompletionStrategy
    implements ICompletionStrategy
{
    constructor(
        private registry: TypeRegistry
    ) {}

    public supports(
        match: XmlAttributeMatch
    ): boolean
    {
        return (
            match.tag === "preference"
            && match.attribute === "for"
        );
    }

    public complete(
        match: XmlAttributeMatch,
        prefix: string
    ): vscode.CompletionItem[]
    {
        return this.registry
            .search(prefix, [PhpTypeKind.Interface])
            .map(type => {

                const item = new vscode.CompletionItem(
                    type.fqcn,
                    vscode.CompletionItemKind.Interface
                );

                item.insertText = type.fqcn;
                item.filterText = type.fqcn;
                item.sortText = type.fqcn;
                item.detail = "PHP Interface";

                item.range = match.range;

                return item;

            });
    }
}