import * as vscode from "vscode";

export interface XmlNode {
    name: string;
    attributes: Map<string, string>;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class XmlScanner 
{
    public scan(
        xml: string,
        uri: vscode.Uri,
        tags: string[]
    ): XmlNode[]
    {
        const nodes: XmlNode[] = [];

        for (const tag of tags) {

            this.collectTag(
                xml,
                uri,
                new RegExp(`<${tag}\\b([^>]*)>`, "g"),
                tag,
                nodes
            );

        }

        return nodes;
    }

    private collectTag(
        xml: string,
        uri: vscode.Uri,
        regex: RegExp,
        tagName: string,
        out: XmlNode[]
    ) {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(xml)) !== null) {
            const fullTag = match[0];
            const attrs = match[1];

            const attributes = new Map<string, string>();
            const attrRegex = /([a-zA-Z0-9:_-]+)\s*=\s*"([^"]*)"/g;

            let a: RegExpExecArray | null;
            while ((a = attrRegex.exec(attrs)) !== null) {
                attributes.set(a[1], a[2]);
            }

            const offset = match.index;
            out.push({
                name: tagName,
                attributes,
                uri,
                offset,
                length: fullTag.length
            });
        }
    }
}