import * as vscode from "vscode";
import { TypeEntry } from "../index/TypeEntry";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";

export class CompletionItemFactory
{
    public createPhpType(
        match: XmlAttributeMatch,
        type: TypeEntry,
        kind: vscode.CompletionItemKind,
        detail: string
    ): vscode.CompletionItem
    {
        const item = new vscode.CompletionItem(
            type.fqcn,
            kind
        );

        item.insertText = type.fqcn;
        item.filterText = type.fqcn;
        item.sortText = type.fqcn;

        item.detail = detail;
        item.documentation = `${type.namespace}\\${type.className}`;

        item.textEdit = new vscode.TextEdit(
            match.range,
            type.fqcn
        );

        // optimimal
        item.detail = type.namespace ?? "";
        // item.description = this.detail;
        item.label = {
            label: type.className,
            description: type.namespace ?? "",
            detail: detail
        };

        return item;
    }
}