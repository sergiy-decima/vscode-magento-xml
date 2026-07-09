import * as vscode from "vscode";

import { TypeBuilder } from "../index/TypeBuilder";
import { TypeRegistry } from "../index/TypeRegistry";

/**
 * Реагує на зміни у файловій системі.
 * Watches workspace PHP files and updates the type registry incrementally.
 */
export class WorkspaceWatcher implements vscode.Disposable {
    private readonly watcher: vscode.FileSystemWatcher;
    private readonly pending = new Set<string>();
    private timer: NodeJS.Timeout | undefined;

    public constructor(
        private readonly builder: TypeBuilder,
        private readonly registry: TypeRegistry
    ) {
        this.watcher = vscode.workspace.createFileSystemWatcher("_magento/**/*.php");
        this.watcher.onDidCreate( uri => void this.onCreated(uri) );
        this.watcher.onDidChange( uri => void this.onChanged(uri) );
        this.watcher.onDidDelete( uri => this.onDeleted(uri) );
    }

    /**
     * Starts watching.
     */
    public start(): void {
        console.log("Workspace watcher started.");
    }

    public dispose(): void {
        this.watcher.dispose();
    }

    private async onCreated(uri: vscode.Uri): Promise<void> {
        this.enqueue(uri.fsPath);
    }

    private async onChanged(uri: vscode.Uri): Promise<void> {
        this.registry.removeByFile(uri.fsPath);
        this.enqueue(uri.fsPath);
    }

    private onDeleted(uri: vscode.Uri): void {
        this.registry.removeByFile(uri.fsPath);
    }

    private schedule(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => void this.flush(), 150);
    }

    private async flush(): Promise<void> {
        this.timer = undefined;
        const files = [...this.pending];
        this.pending.clear();
        for (const file of files) {
            this.registry.removeByFile(file);
            await this.builder.buildFile(file);
        }
    }

    private enqueue(file: string): void {
        this.pending.add(file);
        this.schedule();
    }
}