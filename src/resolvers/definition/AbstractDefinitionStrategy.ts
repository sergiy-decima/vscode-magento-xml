import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { TypeRegistry } from "../../index/TypeRegistry";
import { DiIndex } from "../../index/DiIndex";
import { IDefinitionStrategy } from "../IDefinitionStrategy";

export abstract class AbstractDefinitionStrategy
    implements IDefinitionStrategy
{
    constructor(
        protected readonly registry: TypeRegistry,
        protected readonly diIndex: DiIndex
    ) {}

    public abstract resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>;

    protected async toLocation(
        uri: vscode.Uri,
        offset: number
    ): Promise<vscode.Location>
    {
        const document =
            await vscode.workspace.openTextDocument(uri);

        return new vscode.Location(
            uri,
            document.positionAt(offset)
        );
    }

    protected isAttribute(
        match: XmlAttributeMatch,
        ...attributes: string[]
    ): boolean
    {
        return attributes.includes(match.attribute);
    }

    protected async toEntryLocation(
        entry: {
            uri: vscode.Uri;
            offset: number;
        } | undefined
    ): Promise<vscode.Location | undefined>
    {
        if (!entry) {
            return;
        }

        return this.toLocation(
            entry.uri,
            entry.offset
        );
    }
}