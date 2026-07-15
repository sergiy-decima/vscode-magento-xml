import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class ObserverDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        if (match.tag !== "observer") {
            return;
        }

        if (!this.isAttribute(match, "instance")) {
            return;
        }

        return this.toEntryLocation(
            this.registry.find(match.value)
        );
    }
}