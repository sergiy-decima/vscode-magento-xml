import * as vscode from "vscode";

export interface XmlContext
{
    ownerType?: string;
}

export class XmlContextResolver
{
    public static resolve(
        document: vscode.TextDocument,
        offset: number
    ): XmlContext
    {
        const text = document.getText().substring(0, offset);

        const result: XmlContext = {};

        //
        // nearest <type name="...">
        //
        const typeRegex =
            /<type\s+[^>]*name="([^"]+)"/g;

        let match: RegExpExecArray | null;

        while ((match = typeRegex.exec(text)) !== null) {
            result.ownerType = match[1];
        }

        //
        // nearest <virtualType type="...">
        //
        const virtualRegex =
            /<virtualType\s+[^>]*type="([^"]+)"/g;

        while ((match = virtualRegex.exec(text)) !== null) {
            result.ownerType = match[1];
        }

        return result;
    }
}