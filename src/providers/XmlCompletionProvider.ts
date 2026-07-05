import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";

export class XmlCompletionProvider implements vscode.CompletionItemProvider 
{
    constructor(private registry: TypeRegistry) {}

    provideCompletionItems(): vscode.CompletionItem[] {
        return this.registry.all().map(entry => {
            const item = new vscode.CompletionItem(entry.fqcn);
            item.kind = vscode.CompletionItemKind.Class;
            return item;
        });
    }
}