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

    protected abstract readonly phpKinds:
        readonly PhpTypeKind[];

    protected abstract readonly completionKind:
        vscode.CompletionItemKind;

    protected abstract readonly detail:
        string;

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

            search =
                xml.attribute.value;

        } else if (xml.inText) {

            search =
                xml.node?.text.trim() ?? "";
        }

        console.log(
            "========================================"
        );

        console.log(
            "COMPLETION SEARCH:",
            search
        );

        console.log(
            "COMPLETION PHP KINDS:",
            this.phpKinds
        );

        const exact =
            this.registry.find(search);

        console.log(
            "EXACT REGISTRY FIND:",
            exact
                ? {
                    fqcn: exact.fqcn,
                    className: exact.className,
                    namespace: exact.namespace,
                    kind: exact.kind,
                    file: exact.file
                }
                : "NOT FOUND"
        );

        const searchResult =
            this.registry.search(
                search,
                this.phpKinds
            );

        console.log(
            "REGISTRY SEARCH RESULT:",
            searchResult.length
        );

        for (const type of searchResult.slice(0, 20)) {

            console.log(
                "MATCH:",
                type.fqcn,
                type.className,
                type.kind
            );
        }

        /**
         * Additional diagnostic:
         * find by short class name.
         */
        const shortName =
            search.includes("\\")
                ? search.substring(
                    search.lastIndexOf("\\") + 1
                )
                : search;

        const shortResult =
            this.registry.findByShortName(
                shortName
            );

        console.log(
            "SHORT NAME:",
            shortName
        );

        console.log(
            "SHORT NAME RESULT:",
            shortResult.length
        );

        for (const type of shortResult.slice(0, 20)) {

            console.log(
                "SHORT MATCH:",
                type.fqcn,
                type.className,
                type.kind
            );
        }

        console.log(
            "========================================"
        );

        return searchResult.map(
            type =>
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