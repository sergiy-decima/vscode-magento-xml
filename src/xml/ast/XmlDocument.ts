import { XmlNode } from "./XmlNode";

export class XmlDocument
{
    constructor(
        public readonly root: XmlNode
    ) {}

    public child(
        name: string
    ): XmlNode | undefined
    {
        return this.root.child(name);
    }

    public childrenOf(
        name: string
    ): XmlNode[]
    {
        return this.root.childrenOf(name);
    }

    public findNode(
        offset: number
    ): XmlNode | undefined
    {
        return this.root.findNode(offset);
    }
}