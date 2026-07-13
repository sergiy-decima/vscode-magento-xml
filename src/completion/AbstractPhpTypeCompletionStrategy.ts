import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { TypeEntry } from "../index/TypeEntry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";
import { CompletionItemFactory } from "./CompletionItemFactory";

export abstract class AbstractPhpTypeCompletionStrategy
    implements ICompletionStrategy
{
    public abstract readonly key: string;

    protected abstract readonly phpKinds: readonly PhpTypeKind[];

    protected abstract readonly completionKind: vscode.CompletionItemKind;

    protected abstract readonly detail: string;

    constructor(
        protected readonly registry: TypeRegistry,
        protected readonly factory: CompletionItemFactory
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
        return this.factory.createPhpType(
            match,
            type,
            this.completionKind,
            this.detail
        );
    }
}