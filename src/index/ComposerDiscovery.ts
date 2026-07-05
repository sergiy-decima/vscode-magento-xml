import * as vscode from "vscode";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Psr4Root } from "./Psr4Root";

interface ComposerJson {
    autoload?: {
        "psr-4"?: Record<string, string | string[]>;
    };
}

/**
 * пошук директорій
 */
export class ComposerDiscovery 
{
    /**
     * Головний метод: повертає всі PSR-4 roots у workspace
     */
    public async discover(): Promise<Psr4Root[]> {
        const roots: Psr4Root[] = [];
        const workspaces = vscode.workspace.workspaceFolders ?? [];
        for (const workspace of workspaces) {
            const base = workspace.uri.fsPath;
            await this.scanVendor(path.join(base, "_magento", "vendor"), roots);
            await this.scanAppCode(path.join(base, "_magento", "app", "code"), roots);
        }
        console.log("PSR-4 root workspaces:", roots.length);

        return roots;
    }

    /**
     * Шукає composer.json тільки в межах заданої директорії 'vendorDir'
     */
    private async scanVendor(
        vendorDir: string,
        roots: Psr4Root[]
    ): Promise<void> {
        if (!await this.exists(vendorDir)) {
            return;
        }

        const vendors = await fs.readdir(vendorDir, {withFileTypes: true});
        for (const vendor of vendors) {
            if (!vendor.isDirectory()) {
                continue;
            }

            const vendorPath = path.join(vendorDir, vendor.name);
            const packages = await fs.readdir(vendorPath, {withFileTypes: true});
            for (const pkg of packages) {
                if (!pkg.isDirectory()) {
                    continue;
                }
                await this.loadComposer(
                    path.join(vendorPath, pkg.name, "composer.json"),
                    roots
                );
            }
        }
    }

    /**
     * Шукає composer.json тільки в межах заданої директорії 'appCode'
     */
    private async scanAppCode(
        appCode: string,
        roots: Psr4Root[]
    ): Promise<void> {
        if (!await this.exists(appCode)) {
            return;
        }
        const vendors = await fs.readdir(appCode, {withFileTypes: true});
        for (const vendor of vendors) {
            if (!vendor.isDirectory()) {
                continue;
            }
            const vendorPath = path.join(appCode, vendor.name);
            const modules = await fs.readdir(vendorPath, {withFileTypes: true});
            for (const module of modules) {
                if (!module.isDirectory()) {
                    continue;
                }
                await this.loadComposer(
                    path.join(vendorPath, module.name, "composer.json"),
                    roots
                );
            }
        }
    }

    /**
     * Читає psr-4 з composer.json
     */
    private async loadComposer(
        composerFile: string,
        roots: Psr4Root[]
    ): Promise<void> {
        if (!await this.exists(composerFile)) {
            return;
        }

        try {
            const json: ComposerJson = JSON.parse(await fs.readFile(composerFile, "utf8"));
            const psr4 = json.autoload?.["psr-4"];
            if (!psr4) {
                return;
            }

            const baseDir = path.dirname(composerFile);
            for (const [namespace, value] of Object.entries(psr4)) {
                const paths = Array.isArray(value) ? value : [value];
                for (const relative of paths) {
                    roots.push(
                        new Psr4Root(
                            namespace,
                            path.resolve(baseDir, relative)
                        )
                    );
                }
            }
        } catch {
            // ignore invalid composer.json
        }
    }

    private async exists(pathname: string): Promise<boolean> {
        try {
            await fs.access(pathname);
            return true;
        } catch {
            return false;
        }
    }
}