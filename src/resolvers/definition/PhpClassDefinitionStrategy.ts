import * as vscode from "vscode";
import { XmlAttributeMatch } from "../../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class PhpClassDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public supports(
        match: XmlAttributeMatch
    ): boolean
    {
        switch (match.attribute) {

            case "name":
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
                "name",
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

        //
        // <type name="...">
        // <virtualType name="...">
        //
        if (
            match.attribute === "name" &&
            (
                match.tag === "type" ||
                match.tag === "virtualType"
            )
        ) {
            return this.toEntryLocation(
                this.registry.find(match.value)
            );
        }

        return this.toEntryLocation(
            this.registry.find(match.value)
        );
    }
}