import * as vscode from "vscode";

/**
 * Converts character offsets into VS Code positions.
 */
export class DocumentPosition {
    public static async fromOffset(
        uri: vscode.Uri,
        offset: number
    ): Promise<vscode.Position> {
        const document = await vscode.workspace.openTextDocument(uri);

        return document.positionAt(offset);
    }
}