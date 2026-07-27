import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class VirtualTypeDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Definition | undefined>
    {
        if (
            match.tag !== "virtualType" ||
            !this.isAttribute(match, "name")
        ) {
            return;
        }

        const virtualType =
            this.diIndex.findVirtualType(match.value);

        if (!virtualType) {
            return;
        }

        if (
            virtualType.references &&
            virtualType.references.length > 0
        ) {
            return this.toEntryLocations(
                virtualType.references
            );
        }

        return this.toEntryLocation(
            virtualType
        );
    }
}