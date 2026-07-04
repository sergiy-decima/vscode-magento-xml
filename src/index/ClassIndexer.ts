// import * as fs from "node:fs/promises";
// import * as path from "node:path";
// import { PhpClassScanner } from "../php/parser/PhpClassScanner";
// import { Psr4Root } from "./Psr4Resolver";

// export class ClassIndexer {
//     constructor(
//         private readonly scanner: PhpClassScanner
//     ) {}

//     public async build(
//         roots: Psr4Root[]
//     ): Promise<Map<string,string>> {
//         const index = new Map<string,string>();
//         for (const root of roots) {
//             await this.indexDirectory(root.directory, index);
//         }

//         return index;
//     }

//     private async indexDirectory(
//         dir: string,
//         index: Map<string,string>
//     ): Promise<void> {
//         const entries = await fs.readdir(dir, {
//             withFileTypes: true
//         });

//         for (const entry of entries) {
//             const file = path.join(dir, entry.name);
//             if (entry.isDirectory()) {
//                 await this.indexDirectory(file, index);
//                 continue;
//             }

//             if (!entry.name.endsWith(".php")) {
//                 continue;
//             }

//             const content = await fs.readFile(file, "utf8");
//             const symbols = this.scanner.scan(content);
//             for (const symbol of symbols) {
//                 index.set(symbol.fqcn, file);
//             }
//         }
//     }
// }


import * as fs from "node:fs/promises";
import { walk } from "./walk";
import { Psr4Root } from "./Psr4Root";
import { resolvePsr4 } from "./Psr4Resolver";
import { ClassIndex, PhpClass } from "./ClassIndex";

export class ClassIndexer {
    /**
     * Будує індекс класів з PSR-4 roots
     */
    public async build(
        roots: readonly Psr4Root[],
        index: ClassIndex
    ): Promise<void> {
        index.clear();
        for (const root of roots) {
            for await (const file of walk(root.directory)) {
                if (!file.endsWith(".php")) {
                    continue;
                }

                const fqcn = resolvePsr4(file, root);
                const phpClass: PhpClass = {
                    fqcn,
                    uri: this.toUri(file),
                    offset: 0,
                    length: fqcn.length
                };
                index.add(phpClass);
            }
        }
    }

    /**
     * Конвертація шляху у vscode.Uri без залежності від vscode тут
     */
    private toUri(file: string): any {
        return {
            fsPath: file,
            toString: () => file
        };
    }

    /**
     * Перевіряє, що клас можна отримати лише зі шляху.
     * Якщо файл не відповідає PSR-4 — пізніше будемо
     * використовувати PhpClassScanner.
     */
    public async verify(
        fqcn: string,
        file: string,
        scanner?: (source: string) => string[],
    ): Promise<boolean> {
        if (!scanner) {
            return true;
        }
        const source = await fs.readFile(file, "utf8");
        const classes = scanner(source);

        return classes.includes(fqcn);
    }

    /**
     * (fallback майбутнього рівня)
     * Перевірка через парсинг файлу, якщо PSR-4 не спрацював
     */
    public async verifyClass(
        file: string,
        fqcn: string,
        scanner: (source: string) => string[]
    ): Promise<boolean> {
        const source = await fs.readFile(file, "utf8");
        const classes = scanner(source);

        return classes.includes(fqcn);
    }
}