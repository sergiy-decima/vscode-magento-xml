import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { Psr4Root } from "./Psr4Root";

interface ComposerJson {
    autoload?: {
        "psr-4"?: Record<string, string | string[]>;
    };
}

export class ComposerDiscovery {
    /**
     * Головний метод: повертає всі PSR-4 roots у workspace
     */
    public async discover(): Promise<Psr4Root[]> {
        const roots: Psr4Root[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return roots;
        }

        for (const folder of workspaceFolders) {
            const basePath = folder.uri.fsPath;

            // Magento-подібні структури (швидкий шлях, без glob по всьому workspace)
            const candidates = [
                path.join(basePath, "_magento", "app", "code"),
                path.join(basePath, "_magento", "app", "design"),
                path.join(basePath, "_magento", "vendor")
            ];

            for (const dir of candidates) {
                const found = await this.scanDir(dir);
                roots.push(...found);
            }
        }

        return roots;
    }

    /**
     * Шукає composer.json тільки в межах заданої директорії
     */
    private async scanDir(dir: string): Promise<Psr4Root[]> {
        const results: Psr4Root[] = [];
        if (!await this.exists(dir)) {
            return results;
        }

        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (!entry.isDirectory()) {
                continue;
            }

            const composerPath = path.join(fullPath, "composer.json");
            if (await this.exists(composerPath)) {
                const roots = await this.readComposer(composerPath);
                results.push(...roots);
            }

            // рекурсія тільки на рівні vendor/modules
            const nested = await this.scanDir(fullPath);
            results.push(...nested);
        }

        return results;
    }

    /**
     * Читає psr-4 з composer.json
     */
    private async readComposer(composerPath: string): Promise<Psr4Root[]> {
        try {
            const raw = await fs.readFile(composerPath, "utf8");
            const json: ComposerJson = JSON.parse(raw);

            const psr4 = json.autoload?.["psr-4"];
            if (!psr4) {
                return [];
            }

            const dir = path.dirname(composerPath);
            const roots: Psr4Root[] = [];
            for (const [namespace, relPath] of Object.entries(psr4)) {
                const paths = Array.isArray(relPath) ? relPath : [relPath];
                for (const relativePath of paths) {
                    roots.push(new Psr4Root(
                        namespace,
                        path.resolve(dir, relativePath)
                    ));
                }
            }

            return roots;
        } catch {
            return [];
        }
    }

    private async exists(p: string): Promise<boolean> {
        try {
            await fs.access(p);
            return true;
        } catch {
            return false;
        }
    }
}