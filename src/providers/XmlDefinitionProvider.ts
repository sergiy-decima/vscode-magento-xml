import * as vscode from "vscode";

import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";
import { DefinitionResolver } from "../resolvers/DefinitionResolver";
import { XmlFileCache } from "../xml/cache/XmlFileCache";
import { XmlResolver } from "../xml/XmlResolver";

export class XmlDefinitionProvider implements vscode.DefinitionProvider
{
    private readonly xmlResolver = new XmlResolver();

    constructor(
        private readonly xmlCache: XmlFileCache,
        private readonly definitionResolver: DefinitionResolver
    ) {}

    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined>
    {
        const match = XmlAttributeResolver.resolve(
            document,
            position
        );

        if (!match) {
            return;
        }

        //
        // <argument name="...">
        //
        if (
            match.tag === "argument" &&
            match.attribute === "name"
        ) {
            return this.definitionResolver.resolveArgument(
                document,
                position,
                match.value
            );
        }

        return this.definitionResolver.resolve(match);
    }
}