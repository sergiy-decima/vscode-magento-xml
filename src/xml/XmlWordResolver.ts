import * as vscode from "vscode";

export class XmlWordResolver
{
    public static resolve(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined
    {
        const range = document.getWordRangeAtPosition(
            position,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        return document.getText(range);
    }
}