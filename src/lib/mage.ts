import * as vscode from 'vscode';

export function getMagentoSubdir(): string {
    const config = vscode.workspace.getConfiguration();
    return config.get("magento.subdir") || ".";
}
