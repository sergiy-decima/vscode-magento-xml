import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class PluginDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        if (
            match.tag !== "plugin" ||
            !this.isAttribute(match, "type")
        ) {
            return;
        }

        const plugins = this.diIndex.findPlugins(match.value);

        return this.toEntryLocation(
            plugins[0]
        );
    }
}