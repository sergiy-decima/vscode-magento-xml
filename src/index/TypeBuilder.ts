import * as vscode from "vscode";
import { PhpFileWalker } from "./PhpFileWalker";
import { TypeRegistry } from "./TypeRegistry";
import { Psr4Root } from "./Psr4Root";
import { PhpSymbolScanner } from "../php/parser/PhpSymbolScanner";

/**
 * Будує реєстр типів.
 * Обходить файли, будує/наповнює індекс - створює записи
 */
export class TypeBuilder {
    private readonly walker = new PhpFileWalker();
    private readonly scanner = new PhpSymbolScanner();

    /**
     * Будує індекс класів з PSR-4 roots
     */
    public async build(
        rootsPsr4: readonly Psr4Root[],
        registry: TypeRegistry
    ): Promise<void> {
        registry.clear();
        for (const rootPsr4 of rootsPsr4) {
            for await (const file of this.walker.walk(rootPsr4.directory)) {
                const symbol = await this.scanner.scanFirstFile(file);
                if (!symbol) {
                    continue;
                }
                // const fqcn = rootPsr4.resolve(file);
                const fqcn = symbol.fqcn;
                // const clazz: TypeEntry = {fqcn, kind: symbol.kind, uri: vscode.Uri.file(file), offset: symbol.offset, length: symbol.length};
                registry.add({fqcn, kind: symbol.kind, uri: vscode.Uri.file(file), offset: symbol.offset, length: symbol.length});
            }
        }
        console.log(`Indexed classes: ${registry.size()}`);
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