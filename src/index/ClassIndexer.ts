import * as vscode from "vscode";
import * as fs from "node:fs/promises";
import { PhpFileWalker } from "./PhpFileWalker";
import { ClassIndex } from "./ClassIndex";
import { IndexedClass } from "./IndexedClass";
import { Psr4Root } from "./Psr4Root";
import { PhpSymbolScanner } from "../php/parser/PhpSymbolScanner";

/**
 * обходить файли
 */
export class ClassIndexer {
    private readonly walker = new PhpFileWalker();
    private readonly scanner = new PhpSymbolScanner();

    /**
     * Будує індекс класів з PSR-4 roots
     */
    public async build(
        rootsPsr4: readonly Psr4Root[],
        index: ClassIndex
    ): Promise<void> {
        index.clear();
        for (const rootPsr4 of rootsPsr4) {
            for await (const file of this.walker.walk(rootPsr4.directory)) {
                const symbol = await this.scanner.scanFirstFile(file);
                if (!symbol) {
                    continue;
                }
                // const fqcn = rootPsr4.resolve(file);
                const fqcn = symbol.fqcn;
                // const clazz: IndexedClass = {fqcn, kind: symbol.kind, uri: vscode.Uri.file(file), offset: symbol.offset, length: symbol.length};
                index.add({fqcn, kind: symbol.kind, uri: vscode.Uri.file(file), offset: symbol.offset, length: symbol.length});
            }
        }
        console.log(`Indexed classes: ${index.size()}`);
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
}