import * as vscode from "vscode";
import { TypeBuilder } from "../index/TypeBuilder";
import { DocumentManager } from "../vscode/DocumentManager";

/**
 * Watches PHP files and keeps TypeRegistry up to date.
 * Реагує на зміни у файловій системі.
 * Watches workspace PHP files and updates the type registry incrementally.
 * PHP file created -> buildFile() -> PHP file changed -> buildFile() -> PHP file deleted -> removeFile()
 */
export class WorkspaceWatcher implements vscode.Disposable {
    private readonly watcher: vscode.FileSystemWatcher;
    private readonly pendingFiles = new Set<string>();
    private timer: NodeJS.Timeout | undefined;

    public constructor(
        private readonly builder: TypeBuilder,
        private readonly documents: DocumentManager
    ) {
        this.watcher = vscode.workspace.createFileSystemWatcher("**/*.php");
    }

    /**
     * Starts watching.
     */
    public start(): WorkspaceWatcher {
        this.watcher.onDidCreate( uri => void this.onCreated(uri) );
        this.watcher.onDidChange( uri => void this.onChanged(uri) );
        this.watcher.onDidDelete(this.onDeleted, this);
        console.log("Workspace watcher started.");

        return this;
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
    private async onCreated(uri: vscode.Uri): Promise<void> {
        this.enqueue(uri.fsPath);
    }

    /**
     * PHP file changed.
     */
    private async onChanged(uri: vscode.Uri): Promise<void> {
        this.enqueue(uri.fsPath);
    }

    /**
     * PHP file deleted.
     */
    private onDeleted(uri: vscode.Uri): void {
        this.builder.removeFile(uri.fsPath);
        this.documents.remove(uri.fsPath);
        console.log(`[Index] Removed: ${uri.fsPath}`);
    }

    private scheduleFlush(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => void this.flush(), 150);
    }

    private async flush(): Promise<void> {
        this.timer = undefined;
        const files = [...this.pendingFiles];
        this.pendingFiles.clear();
        for (const file of files) {
            try {
                this.documents.remove(file);
                this.builder.removeFile(file);
                await this.builder.buildFile(file);
                console.log(`[Index] Updated: ${file}`);
            } catch (e) {
                console.error(e);
            }
        }
    }

    private enqueue(file: string): void {
        this.pendingFiles.add(file);
        this.scheduleFlush();
    }
}