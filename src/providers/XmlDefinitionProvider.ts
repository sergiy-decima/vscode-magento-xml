import * as vscode from "vscode";
import { ClassIndex } from "../indexer/ClassIndex";
import { extractWord } from "../utils/PhpParser";

export class XmlDefinitionProvider implements vscode.DefinitionProvider 
{
    constructor(private index: ClassIndex) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined>
    {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_\\]+/);

        if (!range) {
            console.log("NO RANGE");
            return;
        }

        const word = document.getText(range);
        console.log("WORD =", word);
        const found = this.index.find(word);
        console.log("FOUND =", found);

        if (!found) {
            return;
        }

        // console.log(found.uri.toString());
        // console.log(found.uri.fsPath);
        // console.log(found.line);

        // const doc = await vscode.workspace.openTextDocument(found.uri);
        // await vscode.window.showTextDocument(doc);

        return new vscode.Location(
            found.uri,
            new vscode.Position(found.line, 0)
        );
    }
}