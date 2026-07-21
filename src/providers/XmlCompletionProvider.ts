import * as vscode from "vscode";

import { CompletionEngine } from "../completion/CompletionEngine";
import { XmlFileCache } from "../xml/cache/XmlFileCache";
import { XmlResolver } from "../xml/XmlResolver";

export class XmlCompletionProvider
    implements vscode.CompletionItemProvider
{
    private readonly resolver = new XmlResolver();

    constructor(
        private readonly cache: XmlFileCache,
        private readonly engine: CompletionEngine
    ) {}

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[]
    {
        const xml = this.cache.get(
            document.fileName
        );

        if (!xml) {
            return [];
        }

        const result = this.resolver.resolve(
            xml,
            document.offsetAt(position)
        );

        // console.log(result);

        return this.engine.complete(
            document,
            position,
            result
        );
    }
}