import * as vscode from "vscode";
import { CompletionEngine } from "../completion/CompletionEngine";
import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";

export class XmlCompletionProvider implements vscode.CompletionItemProvider
{
    constructor(
        private engine: CompletionEngine
    ) {}

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[]
    {
        const match = XmlAttributeResolver.resolve(
            document,
            position
        );

        if (!match) {
            return [];
        }

        return this.engine.complete(match);
    }
}