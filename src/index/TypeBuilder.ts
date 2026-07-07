import { PhpFileWalker } from "./PhpFileWalker";
import { TypeRegistry } from "./TypeRegistry";
import { Psr4Root } from "./Psr4Root";
import { PhpSymbolScanner } from "../php/parser/PhpSymbolScanner";
import { TypeEntryFactory } from "./TypeEntryFactory";

/**
 * Будує реєстр типів.
 * Обходить файли, будує/наповнює індекс - створює записи
 * 
 * Builds PHP type entry (index).
 * PSR-4 roots -> PHP files -> PhpType -> TypeEntry
 */
export class TypeBuilder {
    private readonly walker = new PhpFileWalker();
    private readonly scanner = new PhpSymbolScanner();
    private readonly factory = new TypeEntryFactory();

    /**
     * Будує індекс класів з PSR-4 roots
     * Build type registry from PSR-4 roots
     */
    public async build(roots: readonly Psr4Root[], registry: TypeRegistry): Promise<void> {
        registry.clear();
        for (const root of roots) {
            for await ( const file of this.walker.walk(root.directory) ) {
                const types = await this.scanner.scanFile(file);
                for (const phpType of types) {
                    const entry = this.factory.create(file, phpType);
                    registry.add(entry);
                }
            }
        }
        console.log(`Indexed PHP types: ${registry.size()}`);
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