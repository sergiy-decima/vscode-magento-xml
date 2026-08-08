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

    ownerArgument?: XmlNode;
    ownerItem?: XmlNode;

    argumentType?: string;

    inAttribute: boolean;

    /**
     * Cursor is inside node text.
     */
    inText: boolean;
}

export class XmlResolver
{
    public resolve(
        document: XmlDocument,
        offset: number
    ): XmlResolveResult
    {
        const node = document.findNode(offset);

        console.log('XmlResolver.resolve()');
        console.log({
            node: node?.name,
            offset,
            text: node?.text,
            textOffset: node?.textOffset,
            textLength: node?.textLength,
            containsText: node?.containsText(offset)
        });

        if (!node) {
            return {
                inAttribute: false,
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

            ownerType: this.closest(node, "type"),
            ownerVirtualType: this.closest(node, "virtualType"),
            ownerPreference: this.closest(node, "preference"),
            ownerPlugin: this.closest(node, "plugin"),

            ownerArgument: this.closest(node, "argument"),
            ownerItem: this.closest(node, "item"),

            argumentType:
                node.attribute("xsi:type")?.value ??
                this.closest(node, "item")
                    ?.attribute("xsi:type")
                    ?.value ??
                this.closest(node, "argument")
                    ?.attribute("xsi:type")
                    ?.value,

            inAttribute: attribute !== undefined,

            inText:
                attribute === undefined &&
                node.containsText(offset)
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