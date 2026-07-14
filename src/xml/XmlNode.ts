import * as vscode from "vscode";
import { XmlAttribute } from "./XmlAttribute";

export class XmlNode
{
    public readonly children: XmlNode[] = [];

    constructor(
        public readonly name: string,
        public readonly uri: vscode.Uri,
        public readonly offset: number,
        public readonly length: number,
        private readonly attributes: XmlAttribute[]
    ) {}

    public attribute(
        name: string
    ): XmlAttribute | undefined
    {
        return this.attributes.find(
            attr => attr.name === name
        );
    }

    public attributesList(): readonly XmlAttribute[]
    {
        return this.attributes;
    }

    public hasAttribute(
        name: string
    ): boolean
    {
        return this.attribute(name) !== undefined;
    }

    public addChild(
        child: XmlNode
    ): void
    {
        this.children.push(child);
    }

    public child(
        name: string
    ): XmlNode | undefined
    {
        return this.children.find(
            node => node.name === name
        );
    }

    public childrenOf(
        name: string
    ): XmlNode[]
    {
        return this.children.filter(
            node => node.name === name
        );
    }
}