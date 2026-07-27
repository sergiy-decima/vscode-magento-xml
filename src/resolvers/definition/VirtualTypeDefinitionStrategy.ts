import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class VirtualTypeDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        if (!this.isAttribute(match, "type")) {
            return;
        }

        const virtualType =
            this.diIndex.findVirtualType(match.value);

        if (!virtualType) {
            return;
        }

        return this.toEntryLocation(
            this.registry.find(virtualType.type)
        );
    }
}