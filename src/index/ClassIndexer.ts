import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PhpClassScanner } from "../php/parser/PhpClassScanner";
import { Psr4Root } from "./Psr4Resolver";

export class ClassIndexer {
    constructor(
        private readonly scanner: PhpClassScanner
    ) {}

    public async build(
        roots: Psr4Root[]
    ): Promise<Map<string,string>> {
        const index = new Map<string,string>();
        for (const root of roots) {
            await this.indexDirectory(root.directory, index);
        }

        return index;
    }

    private async indexDirectory(
        dir: string,
        index: Map<string,string>
    ): Promise<void> {
        const entries = await fs.readdir(dir, {
            withFileTypes: true
        });

        for (const entry of entries) {
            const file = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await this.indexDirectory(file, index);
                continue;
            }

            if (!entry.name.endsWith(".php")) {
                continue;
            }

            const content = await fs.readFile(file, "utf8");
            const symbols = this.scanner.scan(content);
            for (const symbol of symbols) {
                index.set(symbol.fqcn, file);
            }
        }
    }
}