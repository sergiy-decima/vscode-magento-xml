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

        const plugin =
            this.diIndex.findPlugins(match.value)[0];

        if (!plugin) {
            return;
        }

        return this.toEntryLocation(
            this.registry.find(plugin.plugin)
        );
    }
}