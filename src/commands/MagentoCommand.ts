import * as vscode from 'vscode';

export interface MagentoCommand {
    register(
        context: vscode.ExtensionContext
    ): void;
}