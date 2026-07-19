import * as vscode from "vscode";

export interface XmlContext
{
    type?: string;
    virtualType?: string;
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
            result.type = match[1];
        }

        //
        // nearest <virtualType name="...">
        //
        const virtualRegex =
            /<virtualType\s+[^>]*name="([^"]+)"/g;

        while ((match = virtualRegex.exec(text)) !== null) {
            result.virtualType = match[1];
        }

        return result;
    }
}