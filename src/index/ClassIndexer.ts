import * as fs from "node:fs/promises";
import { walk } from "./walk";
import { Psr4Root } from "./Psr4Root";
import { ClassIndex } from "./ClassIndex";
import { IndexedClass } from "./IndexedClass";

/**
 * обходить файли
 */
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
                const fqcn = root.resolve(file);
                const clazz: IndexedClass = {fqcn, file, offset: 0, length: 0};
                index.add(clazz);
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