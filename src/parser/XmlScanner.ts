import * as vscode from "vscode";
import { XmlAttribute } from "../xml/XmlAttribute";
import { XmlNode } from "../xml/XmlNode";

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
    ): void
    {
        let match: RegExpExecArray | null;

        while ((match = regex.exec(xml)) !== null) {

            const fullTag = match[0];
            const attrs = match[1];

            const attributes: XmlAttribute[] = [];

            const attrRegex = /([a-zA-Z0-9:_-]+)="([^"]+)"/g;

            let attr: RegExpExecArray | null;

            while ((attr = attrRegex.exec(attrs)) !== null) {

                const value = attr[2];

                const valueOffset =
                    match.index +
                    fullTag.indexOf(`"${value}"`) +
                    1;

                attributes.push({
                    name: attr[1],
                    value,
                    offset: valueOffset,
                    length: value.length
                });

            }

            out.push(
                new XmlNode(
                    tagName,
                    uri,
                    match.index,
                    fullTag.length,
                    attributes
                )
            );
        }
    }
}