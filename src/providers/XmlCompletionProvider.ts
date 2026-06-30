import * as vscode from "vscode";
import { ClassIndex } from "../indexer/ClassIndex";

export class XmlCompletionProvider implements vscode.CompletionItemProvider {

    constructor(private index: ClassIndex) {}

    provideCompletionItems(): vscode.CompletionItem[] {
        return this.index.all().map(cls => {
            const item = new vscode.CompletionItem(cls.fqcn);
            item.kind = vscode.CompletionItemKind.Class;
            return item;
        });
    }
}