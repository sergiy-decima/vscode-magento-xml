import * as vscode from "vscode";

export interface XmlAttributeMatch
{
    tag: string;
    attribute: string;
    value: string;
    valueStart: number;
    valueEnd: number;
    range: vscode.Range;
}

export class XmlAttributeResolver
{
    public static resolve(
        document: vscode.TextDocument,
        position: vscode.Position
    ): XmlAttributeMatch | undefined
    {
        const offset = document.offsetAt(position);
        const text = document.getText();

        const tagStart = text.lastIndexOf("<", offset);

        if (tagStart === -1) {
            return;
        }

        const tagEnd = text.indexOf(">", tagStart);

        if (tagEnd === -1 || offset > tagEnd) {
            return;
        }

        const tagText = text.substring(tagStart, tagEnd + 1);

        const tagMatch = tagText.match(/^<\s*([^\s/>]+)/);

        if (!tagMatch) {
            return;
        }

        const tag = tagMatch[1];

        const attributeRegex = /([^\s=]+)\s*=\s*"([^"]*)"/g;

        let match: RegExpExecArray | null;

        while ((match = attributeRegex.exec(tagText)) !== null) {

            const attribute = match[1];
            const value = match[2];

            const quoteStart =
                tagStart +
                match.index +
                match[0].indexOf('"') +
                1;

            const quoteEnd = quoteStart + value.length;

            if (offset >= quoteStart && offset <= quoteEnd) {

                return {
                    tag,
                    attribute,
                    value,
                    valueStart: quoteStart,
                    valueEnd: quoteEnd,
                    range: new vscode.Range(
                        document.positionAt(quoteStart),
                        document.positionAt(quoteEnd)
                    )
                };

            }

        }

        return;
    }
}