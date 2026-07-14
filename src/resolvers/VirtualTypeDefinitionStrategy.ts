import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { AbstractDefinitionStrategy } from "./AbstractDefinitionStrategy";

export class VirtualTypeDefinitionStrategy
    extends AbstractDefinitionStrategy
{
    public supports(
        match: XmlAttributeMatch
    ): boolean
    {
        return match.attribute === "type";
    }

    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        if (!this.isAttribute(match, "type")) {
            return;
        }

        return this.toEntryLocation(
            this.diIndex.findVirtualType(match.value)
        );
    }
}