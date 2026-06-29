import * as cp from "child_process";
import * as path from "path";
import * as vscode from "vscode";

import { getMagentoSubdir } from '../lib/mage';

export class ComposerLoader 
{
    async loadPsr4(): Promise<Record<string, string[]>> {

        const root = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        if (!root) {
            return {};
        }

        const magentoSubdir = getMagentoSubdir();

        const script = `
$map = require '${path.join(root, `${magentoSubdir}/vendor/composer/autoload_psr4.php`).replace(/\\/g, "\\\\")}';
echo json_encode($map);
`;

        return new Promise((resolve, reject) => {
            cp.execFile(
                "php",
                ["-r", script],
                (err, stdout) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(stdout));
                }
            );
        });
    }
}