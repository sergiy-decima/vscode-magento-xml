import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";

export interface IHoverStrategy
{
    resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Hover | undefined>;
}