import * as vscode from "vscode";
import { TypeRegistry } from "../../index/TypeRegistry";
import { DiIndex } from "../../index/DiIndex";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { IHoverStrategy } from "../IHoverStrategy";

export abstract class AbstractHoverStrategy
    implements IHoverStrategy
{
    constructor(
        protected readonly registry: TypeRegistry,
        protected readonly diIndex: DiIndex
    ) {}

    protected isAttribute(
        match: XmlAttributeMatch,
        ...attributes: string[]
    ): boolean
    {
        return attributes.includes(match.attribute);
    }

    protected markdown(
        ...lines: string[]
    ): vscode.Hover
    {
        return new vscode.Hover(
            new vscode.MarkdownString(
                lines.join("\n\n")
            )
        );
    }

    public abstract resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Hover | undefined>;
}