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
    ): Promise<vscode.Definition | undefined>;

    protected async toLocation(
        uri: vscode.Uri,
        offset: number
    ): Promise<vscode.Location>
    {
        const document =
            await vscode.workspace.openTextDocument(uri);

        const position =
            document.positionAt(offset);

        console.log(
            "LOCATION",
            uri.fsPath,
            offset,
            position.line,
            position.character
        );

        return new vscode.Location(
            uri,
            position
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
            nameOffset?: number;
        } | undefined
    ): Promise<vscode.Location | undefined>
    {
        if (!entry) {
            return;
        }

        return this.toLocation(
            entry.uri,
            entry.nameOffset ?? entry.offset
        );
    }

    protected async toEntryLocations(
        entries: Array<{
            uri: vscode.Uri;
            offset: number;
            nameOffset?: number;
        }>
    ): Promise<vscode.Location[]>
    {
        const locations: vscode.Location[] = [];

        for (const entry of entries) {

            locations.push(
                await this.toLocation(
                    entry.uri,
                    entry.nameOffset ?? entry.offset
                )
            );
        }

        return locations;
    }
}