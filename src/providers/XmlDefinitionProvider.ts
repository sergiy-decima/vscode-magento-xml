import * as vscode from "vscode";
import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";
import { DefinitionResolver } from "../resolvers/DefinitionResolver";
import { XmlContextResolver } from "../xml/XmlContextResolver";

export class XmlDefinitionProvider implements vscode.DefinitionProvider
{
    constructor(
        private definitionResolver: DefinitionResolver
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

        const context = XmlContextResolver.resolve(
            document,
            document.offsetAt(position)
        );

        // <argument name="...">
        if (
            match.tag === "argument" &&
            match.attribute === "name" &&
            context?.ownerType
        ) {

            console.log("XML context:", context);
            console.log("XML match:", match);

            return this.definitionResolver.resolveArgument(
                context.ownerType,
                match.value
            );
        }

        return this.definitionResolver.resolve(match);
    }
}