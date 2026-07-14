import * as vscode from "vscode";
import { ReferenceResolver } from "../resolvers/ReferenceResolver";

export class XmlReferenceProvider
    implements vscode.ReferenceProvider
{
    constructor(
        private readonly resolver: ReferenceResolver
    ) {}

    public provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Location[]>
    {
        const range = document.getWordRangeAtPosition(
            position,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return [];
        }

        const value = document.getText(range);

        return this.resolver.resolve(value);
    }
}