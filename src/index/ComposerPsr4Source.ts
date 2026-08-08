import * as vscode from "vscode";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { PhpFileWalker } from "./PhpFileWalker";
import { Psr4Root } from "./Psr4Root";
import { TypeIndexSource } from "./TypeIndexSource";
import { TypeSourceEntry } from "./TypeSourceEntry";

interface ComposerJson {
    autoload?: {
        "psr-4"?: Record<string, string | string[]>;
    };
}

/**
 * Reads PSR-4 autoload configuration from composer.json
 * and yields PHP files from all discovered roots.
 *
 * Magento-specific:
 * app/code modules are also indexed when their composer.json
 * does not contain autoload.psr-4.
 */
export class ComposerPsr4Source implements TypeIndexSource {
    private readonly walker = new PhpFileWalker();

    public async *entries(): AsyncIterable<TypeSourceEntry> {
        const roots = await this.discoverRoots();

        for (const root of roots) {
            for await (const file of this.walker.walk(root.directory)) {
                yield {file};
            }
        }
    }

    /**
     * Discover all PSR-4 roots in current workspace.
     */
    private async discoverRoots(): Promise<Psr4Root[]> {
        const roots: Psr4Root[] = [];

        const workspaces =
            vscode.workspace.workspaceFolders ?? [];

        for (const workspace of workspaces) {

            const base =
                workspace.uri.fsPath;

            await this.scanVendor(
                path.join(
                    base,
                    "_magento",
                    "vendor"
                ),
                roots
            );

            await this.scanAppCode(
                path.join(
                    base,
                    "_magento",
                    "app",
                    "code"
                ),
                roots
            );
        }

        return roots;
    }

    /**
     * Scan vendor packages.
     */
    private async scanVendor(
        vendorDir: string,
        roots: Psr4Root[]
    ): Promise<void> {
        if (!await this.exists(vendorDir)) {
            return;
        }

        const vendors =
            await fs.readdir(
                vendorDir,
                {withFileTypes: true}
            );

        for (const vendor of vendors) {

            if (!vendor.isDirectory()) {
                continue;
            }

            const vendorPath =
                path.join(
                    vendorDir,
                    vendor.name
                );

            const packages =
                await fs.readdir(
                    vendorPath,
                    {withFileTypes: true}
                );

            for (const pkg of packages) {

                if (!pkg.isDirectory()) {
                    continue;
                }

                await this.loadComposer(
                    path.join(
                        vendorPath,
                        pkg.name,
                        "composer.json"
                    ),
                    roots
                );
            }
        }
    }

    /**
     * Scan app/code modules.
     *
     * Magento modules are not required to have
     * autoload.psr-4 in their local composer.json.
     */
    private async scanAppCode(
        appCode: string,
        roots: Psr4Root[]
    ): Promise<void> {
        if (!await this.exists(appCode)) {
            return;
        }

        const vendors =
            await fs.readdir(
                appCode,
                {withFileTypes: true}
            );

        for (const vendor of vendors) {

            if (!vendor.isDirectory()) {
                continue;
            }

            const vendorPath =
                path.join(
                    appCode,
                    vendor.name
                );

            const modules =
                await fs.readdir(
                    vendorPath,
                    {withFileTypes: true}
                );

            for (const module of modules) {

                if (!module.isDirectory()) {
                    continue;
                }

                const modulePath =
                    path.join(
                        vendorPath,
                        module.name
                    );

                const composerFile =
                    path.join(
                        modulePath,
                        "composer.json"
                    );

                const before =
                    roots.length;

                await this.loadComposer(
                    composerFile,
                    roots
                );

                /**
                 * Fallback for Magento app/code modules
                 * without local PSR-4 configuration.
                 *
                 * The module directory itself is indexed.
                 */
                if (roots.length === before) {

                    console.log(
                        "[PSR-4] Fallback app/code:",
                        modulePath
                    );

                    roots.push(
                        new Psr4Root(
                            `${vendor.name}\\${module.name}\\`,
                            modulePath
                        )
                    );
                }
            }
        }
    }

    /**
     * Read composer.json and extract PSR-4 roots.
     */
    private async loadComposer(
        composerFile: string,
        roots: Psr4Root[]
    ): Promise<void> {
        if (!await this.exists(composerFile)) {
            return;
        }

        try {

            const json: ComposerJson =
                JSON.parse(
                    await fs.readFile(
                        composerFile,
                        "utf8"
                    )
                );

            const psr4 =
                json.autoload?.["psr-4"];

            if (!psr4) {
                return;
            }

            const baseDir =
                path.dirname(composerFile);

            for (
                const [namespace, value]
                of Object.entries(psr4)
            ) {

                const paths =
                    Array.isArray(value)
                        ? value
                        : [value];

                for (const relative of paths) {

                    roots.push(
                        new Psr4Root(
                            namespace,
                            path.resolve(
                                baseDir,
                                relative
                            )
                        )
                    );
                }
            }

        } catch {
            // ignore invalid composer.json
        }
    }

    private async exists(
        pathname: string
    ): Promise<boolean> {
        try {

            await fs.access(pathname);

            return true;

        } catch {

            return false;
        }
    }
}