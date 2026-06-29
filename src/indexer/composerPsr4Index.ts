import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { getMagentoSubdir } from '../lib/mage';

export class ComposerPsr4Index 
{
    private psr4 = new Map<string, string[]>();
    
    async build() {
        const rootDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!rootDir) return;

        const magentoSubdir = getMagentoSubdir();

        const file = path.join(
            rootDir,
            `${magentoSubdir}/vendor/composer/autoload_psr4.php`
        );

        if (!fs.existsSync(file)) {
            vscode.window.showErrorMessage("autoload_psr4.php not found");
            return;
        }

        const content = fs.readFileSync(file, "utf-8");
        const regex = /'([^']+)'\s*=>\s*array\(([^)]+)\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const ns = match[1].replaceAll(/\\\\/g, '\\'); // Remove trailing backslash if present
            const dirsRaw = match[2];
            const dirs = dirsRaw
                .split(',')
                .map(t => t.replaceAll(/['"\s]/g, ''))
                .map(t => t.replaceAll('$baseDir.', `${magentoSubdir}`))
                .map(t => t.replaceAll('$vendorDir.', `${magentoSubdir}/vendor`))
                .filter(Boolean);
            this.psr4.set(ns, dirs);
        }
        console.log(`PSR-4 namespaces indexed: ${this.psr4.size}`);
    }

    resolve(fqcn: string): vscode.Uri | undefined {
        const rootDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        for (const [ns, dirs] of this.psr4.entries()) {
            if (!fqcn.startsWith(ns)) continue;
            const relative = fqcn.substring(ns.length).replace(/\\/g, '/');
            for (const dir of dirs) {
                const fullPath = path.join(
                    rootDir || "",
                    dir,
                    relative + ".php"
                );
                if (fs.existsSync(fullPath)) {
                    return vscode.Uri.file(fullPath);
                }
            }
        }

        // 🔥 FALLBACK (Magento reality)
        const magentoSubdir = getMagentoSubdir();
        const fallbackPaths = [
            `${magentoSubdir}/app/code`,
            `${magentoSubdir}/vendor`
        ];

        const relative = fqcn.replace(/\\/g, "/") + ".php";
        for (const base of fallbackPaths) {
            const full = path.join(rootDir || "", base, relative);
            if (fs.existsSync(full)) {
                return vscode.Uri.file(full);
            }
        }

        return undefined;
    }
}