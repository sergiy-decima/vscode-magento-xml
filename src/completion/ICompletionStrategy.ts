import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";

export interface ICompletionStrategy
{
    supports(
        match: XmlAttributeMatch
    ): boolean;

    complete(
        match: XmlAttributeMatch,
        prefix: string
    ): vscode.CompletionItem[];
}