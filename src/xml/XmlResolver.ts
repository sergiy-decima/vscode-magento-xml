import * as vscode from "vscode";
import { XmlAttribute } from "./ast/XmlAttribute";
import { XmlDocument } from "./ast/XmlDocument";
import { XmlNode } from "./ast/XmlNode";

export interface XmlResolveResult
{
    node?: XmlNode;

    attribute?: XmlAttribute;

    ownerType?: XmlNode;

    ownerVirtualType?: XmlNode;

    ownerPreference?: XmlNode;

    ownerPlugin?: XmlNode;

    range?: vscode.Range;
}

export class XmlResolver
{
    public resolve(
        document: XmlDocument,
        offset: number
    ): XmlResolveResult
    {
        const node = document.findNode(offset);

        if (!node) {
            return {};
        }

        let attribute: XmlAttribute | undefined;

        for (const attr of node.attributes()) {

            if (
                offset >= attr.offset &&
                offset <= attr.offset + attr.length
            ) {
                attribute = attr;
                break;
            }
        }

        return {
            node,
            attribute,
            ownerType: this.closest(node, "type"),
            ownerVirtualType: this.closest(node, "virtualType"),
            ownerPreference: this.closest(node, "preference"),
            ownerPlugin: this.closest(node, "plugin")
        };
    }

    private closest(
        node: XmlNode,
        name: string
    ): XmlNode | undefined
    {
        return node.closest(name);
    }
}