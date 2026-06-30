import * as vscode from "vscode";
import { ClassIndex } from "../index/ClassIndex";

interface SearchResult {
    uri: vscode.Uri;
    line: number;
    text: string;
}

export class GoToDiCommand 
{
    constructor(private readonly classIndex: ClassIndex) {
    }

    public async execute() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const className = this.getClassName(editor);
        if (!className) {
            vscode.window.showWarningMessage(
                "Cursor is not on a Magento class."
            );
            return;
        }

        console.log("Searching DI for", className);
        const files = await vscode.workspace.findFiles("**/etc/**/di.xml");
        const results: SearchResult[] = [];
        
        for (const file of files) {
            const doc = await vscode.workspace.openTextDocument(file);
            for (let i = 0; i < doc.lineCount; i++) {
                const line = doc.lineAt(i).text;
                if (!line.includes(className)) {
                    continue;
                }
                results.push({
                    uri: file,
                    line: i,
                    text: `${file.path}:${i + 1}`
                });
            }
        }

        if (results.length === 0) {
            vscode.window.showInformationMessage(
                "No DI configuration found."
            );
            return;
        }

        if (results.length === 1) {
            await this.open(results[0]);
            return;
        }

        const selected = await vscode.window.showQuickPick(
            results.map(r => ({label: r.text, result: r}))
        );

        if (!selected) {
            return;
        }

        await this.open(selected.result);
    }

    private getClassName(editor: vscode.TextEditor): string | undefined {
        const range = editor.document.getWordRangeAtPosition(
            editor.selection.active,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        const value = editor.document.getText(range);
        if (this.classIndex.find(value)) {
            return value;
        }

        return undefined;
    }

    private async open(result: SearchResult) {
        const doc = await vscode.workspace.openTextDocument(result.uri);
        const editor = await vscode.window.showTextDocument(doc);
        const pos = new vscode.Position(result.line, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos));
    }
}