import * as vscode from "vscode";
import { ClassIndex } from "../index/ClassIndex";
import { extractWord } from "../utils/PhpParser";

export class XmlDefinitionProvider implements vscode.DefinitionProvider 
{
    constructor(private index: ClassIndex) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined> {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_\\]+/);

        if (!range) {
            console.log("NO RANGE");
            return;
        }

        const word = document.getText(range);
        // console.log("WORD =", word);
        const found = this.index.find(word);
        // console.log("FOUND =", found);

        if (!found) {
            return;
        }

        const doc = await vscode.workspace.openTextDocument(found.uri);

        return new vscode.Location(
            found.uri,
            doc.positionAt(found.offset)
        );
    }
}