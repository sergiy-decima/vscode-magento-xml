import * as vscode from "vscode";
import { TypeBuilder } from "./TypeBuilder";

/**
 * Watches PHP files and keeps TypeRegistry up to date.
 *
 * PHP file created -> buildFile() -> PHP file changed -> buildFile() -> PHP file deleted -> removeFile()
 */
export class TypeRegistryWatcher implements vscode.Disposable {
    private readonly watcher: vscode.FileSystemWatcher;

    public constructor(private readonly builder: TypeBuilder) {
        this.watcher = vscode.workspace.createFileSystemWatcher("**/*.php");
        this.watcher.onDidCreate(this.onCreate, this);
        this.watcher.onDidChange(this.onChange, this);
        this.watcher.onDidDelete(this.onDelete, this);
    }

    /**
     * Dispose watcher.
     */
    public dispose(): void {
        this.watcher.dispose();
    }

    /**
     * PHP file created.
     */
    private async onCreate(uri: vscode.Uri): Promise<void> {
        await this.builder.buildFile(uri.fsPath);
        console.log(`[TypeRegistry] created: ${uri.fsPath}`);
    }

    /**
     * PHP file changed.
     */
    private async onChange(uri: vscode.Uri): Promise<void> {
        await this.builder.buildFile(uri.fsPath);
        console.log(`[TypeRegistry] updated: ${uri.fsPath}`);
    }

    /**
     * PHP file deleted.
     */
    private onDelete(uri: vscode.Uri): void {
        this.builder.removeFile(uri.fsPath);
        console.log(`[TypeRegistry] removed: ${uri.fsPath}`);
    }
}