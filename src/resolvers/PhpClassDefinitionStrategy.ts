import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class PhpClassDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public supports(
        match: XmlAttributeMatch
    ): boolean
    {
        switch (match.attribute) {

            case "class":
            case "type":
            case "instance":
            case "for":
            case "parent":
            case "extends":

                return true;

            default:

                return false;
        }
    }

    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        if (
            !this.isAttribute(
                match,
                "class",
                "type",
                "instance",
                "for",
                "parent",
                "extends"
            )
        ) {
            return;
        }

        return this.toEntryLocation(
            this.registry.find(match.value)
        );
    }
}