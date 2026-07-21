import * as vscode from "vscode";

import { XmlAttribute } from "./ast/XmlAttribute";
import { XmlDocument } from "./ast/XmlDocument";
import { XmlNode } from "./ast/XmlNode";

export interface XmlResolveResult
{
    node?: XmlNode;

    attribute?: XmlAttribute;

    /**
     * Cursor is inside node text.
     */
    inText: boolean;

    ownerType?: XmlNode;

    ownerVirtualType?: XmlNode;

    ownerPreference?: XmlNode;

    ownerPlugin?: XmlNode;
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
            return {
                inText: false
            };
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
            inText: node.containsText(offset),
            ownerType: node.closest("type"),
            ownerVirtualType: node.closest("virtualType"),
            ownerPreference: node.closest("preference"),
            ownerPlugin: node.closest("plugin")
        };
    }
}