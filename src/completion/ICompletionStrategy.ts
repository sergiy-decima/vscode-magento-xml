import * as vscode from "vscode";

import { XmlResolveResult } from "../xml/XmlResolver";

export interface ICompletionStrategy
{
    /**
     * Example:
     * preference:for
     * preference:type
     * plugin:type
     * argument:name
     */
    readonly key: string;

    complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        xml: XmlResolveResult
    ): vscode.CompletionItem[];
}