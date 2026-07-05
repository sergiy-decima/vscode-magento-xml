import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";

export class XmlDefinitionProvider implements vscode.DefinitionProvider 
{
    constructor(private registry: TypeRegistry) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined> {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_\\]+/);

        if (!range) {
            console.log("NO RANGE");
            return;
        }

        const fqcn = document.getText(range);
        // console.log("WORD =", fqcn);
        const entry = this.registry.find(fqcn);
        // console.log("FOUND =", entry);

        if (!entry) {
            return;
        }

        const doc = await vscode.workspace.openTextDocument(entry.uri);

        return new vscode.Location(
            entry.uri,
            doc.positionAt(entry.offset)
        );
    }
}