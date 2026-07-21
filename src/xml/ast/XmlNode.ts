import * as vscode from "vscode";
import { XmlAttribute } from "./XmlAttribute";

export class XmlNode
{
    private readonly attributeMap = new Map<string, XmlAttribute>();

    private readonly childMap = new Map<string, XmlNode[]>();

    public readonly children: XmlNode[] = [];

    public parent?: XmlNode;

    constructor(
        public readonly name: string,
        public readonly uri: vscode.Uri,
        public readonly offset: number,
        public length: number,
        attributes: XmlAttribute[]
    ) {
        for (const attribute of attributes) {
            this.attributeMap.set(attribute.name, attribute);
        }
    }

    public addChild(
        child: XmlNode
    ): void
    {
        child.parent = this;

        this.children.push(child);

        let list = this.childMap.get(child.name);

        if (!list) {
            list = [];
            this.childMap.set(child.name, list);
        }

        list.push(child);
    }

    public attribute(
        name: string
    ): XmlAttribute | undefined
    {
        return this.attributeMap.get(name);
    }

    public attributes(): readonly XmlAttribute[]
    {
        return [...this.attributeMap.values()];
    }

    public child(
        name: string
    ): XmlNode | undefined
    {
        return this.childMap.get(name)?.[0];
    }

    public childrenOf(
        name: string
    ): XmlNode[]
    {
        return this.childMap.get(name) ?? [];
    }

    public closest(
        name: string
    ): XmlNode | undefined
    {
        let node: XmlNode | undefined = this;

        while (node) {

            if (node.name === name) {
                return node;
            }

            node = node.parent;
        }

        return;
    }

    public contains(
        offset: number
    ): boolean
    {
        return (
            offset >= this.offset &&
            offset <= this.offset + this.length
        );
    }

    public findNode(
        offset: number
    ): XmlNode | undefined
    {
        if (!this.contains(offset)) {
            return;
        }

        for (const child of this.children) {

            const found = child.findNode(offset);

            if (found) {
                return found;
            }
        }

        return this;
    }
}