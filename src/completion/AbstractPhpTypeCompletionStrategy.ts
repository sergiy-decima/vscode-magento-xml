import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { TypeEntry } from "../index/TypeEntry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export abstract class AbstractPhpTypeCompletionStrategy
    implements ICompletionStrategy
{
    public abstract readonly key: string;

    protected abstract readonly phpKinds: readonly PhpTypeKind[];

    protected abstract readonly completionKind: vscode.CompletionItemKind;

    protected abstract readonly detail: string;

    constructor(
        protected readonly registry: TypeRegistry
    ) {}

    public complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        match: XmlAttributeMatch
    ): vscode.CompletionItem[]
    {
        return this.registry
            .search(match.value, this.phpKinds)
            .map(type => this.createCompletionItem(match, type));
    }

    protected createCompletionItem(
        match: XmlAttributeMatch,
        type: TypeEntry
    ): vscode.CompletionItem
    {
        const item = new vscode.CompletionItem(
            type.fqcn,
            this.completionKind
        );

        item.insertText = type.fqcn;
        item.filterText = type.fqcn;
        item.sortText = type.fqcn;
        item.detail = this.detail;

        item.textEdit = new vscode.TextEdit(
            match.range,
            type.fqcn
        );

        return item;
    }
}