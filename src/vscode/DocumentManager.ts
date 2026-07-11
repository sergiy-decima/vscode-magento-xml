import * as vscode from "vscode";

/**
 * Manages VS Code documents.
 */
export class DocumentManager {
    private readonly cache = new Map<string, vscode.TextDocument>();

    /**
     * Returns a cached document or opens it.
     */
    public async open(
        uri: vscode.Uri
    ): Promise<vscode.TextDocument> {
        const key = uri.fsPath;
        let document = this.cache.get(key);
        if (!document) {
            document = await vscode.workspace.openTextDocument(uri);
            this.cache.set(key, document);
        }

        return document;
    }

    /**
     * Converts character offset to VS Code position.
     */
    public async position(
        uri: vscode.Uri,
        offset: number
    ): Promise<vscode.Position> {
        const document = await this.open(uri);

        return document.positionAt(offset);
    }

    /**
     * Clears cached document.
     */
    public remove(file: string): void {
        this.cache.delete(file);
    }

    /**
     * Clears the cache.
     */
    public clear(): void {
        this.cache.clear();
    }
}