import * as vscode from "vscode";
import { ComposerIndex } from "../indexer/composerIndex";
import { XmlClassResolver } from "../xml/xmlClassResolver";

export class MagentoCompletionProvider implements vscode.CompletionItemProvider
{
    constructor(
        private readonly index: ComposerIndex,
        private readonly resolver: XmlClassResolver
    ) {}

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
        const prefix = this.resolver.getClassPrefix(document, position);
        if (!prefix) {
            return [];
        }
        const result = this.index.complete(prefix);

        // console.log(`Completion items for prefix "${prefix}":`, result.map(entry => entry.fqcn)); // Debugging line
        return result.map(entry => {
            const item = new vscode.CompletionItem(
                entry.fqcn,
                vscode.CompletionItemKind.Class
            );
            item.insertText = entry.fqcn;
            item.detail = entry.uri.fsPath;

            return item;
        });
    }
}