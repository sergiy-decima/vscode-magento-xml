import * as vscode from "vscode";
import { ClassIndex } from "../index/ClassIndex";
import { DiIndex } from "../index/DiIndex";

export class GoToDiCommand 
{
    constructor(
        private readonly classIndex: ClassIndex,
        private readonly diIndex: DiIndex
    ) {}

    public async execute() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const className = this.normalize(this.getClassName(editor) || "");
        // console.log("CLASS UNDER CURSOR:", className);
        if (!className) {
            vscode.window.showInformationMessage("No valid Magento class under cursor");
            return;
        }

        let results = this.diIndex.find(className);
        if (results.length === 0) {
            results = this.diIndex.findByShortName(className);
            if (results.length === 0) {
                vscode.window.showInformationMessage("No DI references found");
                return;
            }
        }
        if (results.length === 1) {
            return this.open(results[0]);
        }

        const picked = await vscode.window.showQuickPick(
            results.map(r => ({
                label: `${r.kind}`,
                description: r.uri.fsPath,
                detail: `offset: ${r.offset}`,
                ref: r
            }))
        );

        if (!picked) {
            return;
        }

        return this.open(picked.ref);
    }

    private async open(ref: any) {
        const doc = await vscode.workspace.openTextDocument(ref.uri);
        const editor = await vscode.window.showTextDocument(doc);
        const pos = doc.positionAt(ref.offset);

        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(
            new vscode.Range(pos, pos)
        );
    }

    private getClassName(editor: vscode.TextEditor): string | undefined {
        const range = editor.document.getWordRangeAtPosition(
            editor.selection.active,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        const text = editor.document.getText(range);

        return this.normalize(text);
    }

    private normalize(name: string): string {
        return name.replace(/^\\/, "");
    }
}