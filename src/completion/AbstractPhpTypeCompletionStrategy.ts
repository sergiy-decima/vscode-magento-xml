import * as vscode from "vscode";

import { TypeRegistry } from "../index/TypeRegistry";
import { TypeEntry } from "../index/TypeEntry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { XmlResolveResult } from "../xml/XmlResolver";
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
        xml: XmlResolveResult
    ): vscode.CompletionItem[]
    {
        let search = "";

        if (xml.attribute) {
            search = xml.attribute.value;
        } else if (xml.inText) {
            search = xml.node?.text.trim() ?? "";
        }

        return this.registry
            .search(search, this.phpKinds)
            .map(type =>
                this.createCompletionItem(
                    document,
                    xml,
                    type
                )
            );
    }

    protected createCompletionItem(
        document: vscode.TextDocument,
        xml: XmlResolveResult,
        type: TypeEntry
    ): vscode.CompletionItem
    {
        return this.factory.createPhpType(
            document,
            xml,
            type,
            this.completionKind,
            this.detail
        );
    }
}