import * as vscode from "vscode";

import { TypeEntry } from "../index/TypeEntry";
import { PhpParameter } from "../php/ast/PhpType";
import { XmlResolveResult } from "../xml/XmlResolver";

export class CompletionItemFactory
{
    public createPhpType(
        document: vscode.TextDocument,
        xml: XmlResolveResult,
        type: TypeEntry,
        kind: vscode.CompletionItemKind,
        detail: string
    ): vscode.CompletionItem
    {
        const item = this.create(
            document,
            xml,
            type.fqcn,
            kind
        );

        item.label = {
            label: type.className,
            description: type.namespace ?? "",
            detail
        };

        item.detail = type.namespace ?? "";
        item.documentation =
            `${type.namespace}\\${type.className}`;

        return item;
    }

    public createParameter(
        document: vscode.TextDocument,
        xml: XmlResolveResult,
        parameter: PhpParameter
    ): vscode.CompletionItem
    {
        const item = this.create(
            document,
            xml,
            parameter.name,
            vscode.CompletionItemKind.Field
        );

        item.detail = parameter.type;

        return item;
    }

    private create(
        document: vscode.TextDocument,
        xml: XmlResolveResult,
        value: string,
        kind: vscode.CompletionItemKind
    ): vscode.CompletionItem
    {
        const item =
            new vscode.CompletionItem(
                value,
                kind
            );

        item.insertText = value;
        item.filterText = value;
        item.sortText = value;

        const range = this.resolveRange(
            document,
            xml
        );

        if (range) {
            item.textEdit =
                new vscode.TextEdit(
                    range,
                    value
                );
        }

        return item;
    }

    private resolveRange(
        document: vscode.TextDocument,
        xml: XmlResolveResult
    ): vscode.Range | undefined
    {
        if (xml.attribute) {

            return new vscode.Range(
                document.positionAt(
                    xml.attribute.offset
                ),
                document.positionAt(
                    xml.attribute.offset +
                    xml.attribute.length
                )
            );
        }

        if (xml.node) {

            return new vscode.Range(
                document.positionAt(
                    xml.node.textOffset
                ),
                document.positionAt(
                    xml.node.textOffset +
                    xml.node.textLength
                )
            );
        }

        return;
    }
}