import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";

export interface IDefinitionStrategy
{
    resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>;
}