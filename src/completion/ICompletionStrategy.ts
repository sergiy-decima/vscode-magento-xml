import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";

export interface ICompletionStrategy
{
    /**
     * Example:
     * preference:for
     * preference:type
     * plugin:type
     */
    readonly key: string;

    complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        match: XmlAttributeMatch
    ): vscode.CompletionItem[];
}