import * as fs from "node:fs/promises";
import * as path from "node:path";

export class PhpFileWalker {
    public async *walk(directory: string): AsyncGenerator<string> {
        // console.log("Parse directory:", directory);
        const entries = await fs.readdir(directory, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {               // .../_magento/vendor/magento/magento-cloud-components/tests
                // Не індексуємо службові каталоги
                switch (entry.name.toLowerCase()) {                // tests
                    case "_files":
                    case ".git":
                    case ".github":
                    case ".idea":
                    case ".vscode":
                //     case "generated":
                    case "node_modules":
                //     case "pub":
                //     case "dev":
                    case "tests":
                    case "test":
                    case "var":
                //     case "vendor":
                        // console.log("Entry name:", entry.name);
                        // console.log("Full PATH:", fullPath);
                        continue;
                }
                yield* this.walk(fullPath);
                continue;
            }

            if (!(entry.isFile() && entry.name.endsWith(".php"))) {
                continue;
            }

            yield fullPath;
        }
    }
}