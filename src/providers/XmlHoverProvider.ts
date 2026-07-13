import * as vscode from "vscode";
import { HoverResolver } from "../resolvers/HoverResolver";

export class XmlHoverProvider
    implements vscode.HoverProvider
{
    constructor(
        private readonly resolver: HoverResolver
    ) {}

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover>
    {
        const range = document.getWordRangeAtPosition(
            position,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        const value = document.getText(range);

        return this.resolver.resolve(value);
    }
}