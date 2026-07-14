import * as vscode from "vscode";
import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";
import { DefinitionResolver } from "../resolvers/DefinitionResolver";

export class XmlDefinitionProvider implements vscode.DefinitionProvider
{
    constructor(
        private definitionResolver: DefinitionResolver
    ) {}

    async provideDefinition(
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

        return this.definitionResolver.resolve(match);
    }
}