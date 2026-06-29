import * as vscode from 'vscode';

import { getMagentoSubdir } from '../lib/mage';

export class PhpClassIndex {

    private map = new Map<string, vscode.Uri>();

    async build() {
        const magentoSubdir = getMagentoSubdir();
        
        const files = await vscode.workspace.findFiles(
            `${magentoSubdir}/**/*.php`,
            `${magentoSubdir}/{generated,var,node_modules,scandipwa,tools,uct}/**`
        );

        for (const file of files) {
            const doc = await vscode.workspace.openTextDocument(file);
            const text = doc.getText();

            const matchNamespace = text.match(/namespace\s+([^;]+);/);
            const matchClass = text.match(/class\s+([A-Za-z0-9_]+)/);

            if (!matchNamespace || !matchClass) {
                continue;
            }

            const fqcn = `${matchNamespace[1]}\\${matchClass[1]}`;

            this.map.set(fqcn, file);
        }

        console.log(`Indexed PHP classes: ${this.map.size}`);
    }

    get(fqcn: string): vscode.Uri | undefined {
        return this.map.get(fqcn);
    }
}