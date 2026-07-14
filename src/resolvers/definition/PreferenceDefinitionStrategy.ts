import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class PreferenceDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        if (!this.isAttribute(match, "for")) {
            return;
        }

        const preferences =
            this.diIndex.findPreferences(match.value);

        return this.toEntryLocation(
            preferences[0]
        );
    }
}