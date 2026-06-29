import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ClassEntry } from './classIndex';

import { getMagentoSubdir } from '../lib/mage';

export class ComposerIndex 
{
    private classMap = new Map<string, ClassEntry>();
    private classes: ClassEntry[] = [];

    public async build() {
        const root = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!root) return;

        const magentoSubdir = getMagentoSubdir();
        
        const classMapPath = path.join(
            root,
            `${magentoSubdir}/vendor/composer/autoload_classmap.php`
        );

        if (!fs.existsSync(classMapPath)) {
            vscode.window.showErrorMessage("Composer classmap not found");
            return;
        }

        const content = fs.readFileSync(classMapPath, "utf-8");
        const regex = /'([^']+)'\s*=>\s*[\$\w]+\s*\.\s*'([^']+)'/g;
        // console.log(`Regex pattern: ${regex}`); // Debugging line
        let match;

        while ((match = regex.exec(content)) !== null) {
            const fqcn = match[1].replaceAll(/\\\\/g, "\\"); // Remove trailing backslash if present
            let relativePath = match[2];
            const filePath = path.join(
                path.dirname(classMapPath),
                relativePath
            );
            const entry: ClassEntry = {
                fqcn,
                uri: vscode.Uri.file(filePath)
            };

            // console.log(`Indexed class: ${fqcn} -> ${filePath} -> ${entry.uri}`); // Debugging line
            this.classMap.set(fqcn, entry);
            this.classes.push(entry);
        }

        console.log(`Composer indexed classes: ${this.classMap.size}`);
    }

    public get(fqcn: string): ClassEntry | undefined {
        return this.classMap.get(fqcn);
    }

    public complete(prefix: string): ClassEntry[] {
        // console.log(`Completing for prefix: ${prefix}`); // Debugging line
        const search = prefix.toLowerCase();
        return this.classes.filter(c =>
            c.fqcn.toLowerCase().startsWith(search)
        );
    }
}