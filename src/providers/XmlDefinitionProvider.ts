import * as vscode from "vscode";
import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";
import { DefinitionResolver } from "../resolvers/DefinitionResolver";
import { XmlContextResolver } from "../xml/XmlContextResolver";

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

        const context = XmlContextResolver.resolve(
            document,
            document.offsetAt(position)
        );

        console.log(context);

        if (!match) {
            return;
        }

        // if (
        //     match.tag === "argument" &&
        //     match.attribute === "name" &&
        //     match.ownerType
        // ) {
        //     return this.definitionResolver.resolveArgument(
        //         match.ownerType,
        //         match.value
        //     );
        // }

        return this.definitionResolver.resolve(match);
    }
}