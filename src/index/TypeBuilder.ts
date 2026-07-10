import { TypeRegistry } from "./TypeRegistry";
import { TypeEntryFactory } from "./TypeEntryFactory";
import { TypeDocumentReader } from "./TypeDocumentReader";
import { TypeIndexSource } from "./TypeIndexSource";

import { PhpTypeParser } from "../php/parser/PhpTypeParser";
import { PhpLexer } from "../php/lexer/PhpLexer";
import { PhpTokenStream } from "../php/parser/PhpTokenStream";

/**
 * Координує процес побудови.
 * Будує реєстр типів.
 * Обходить файли, будує/наповнює індекс - створює записи
 * 
 * Builds PHP type entry (index).
 * PSR-4 roots -> PHP files -> PhpType -> TypeEntry
 * Workspace -> PHP files -> PhpLexer -> PhpTokenStream -> PhpTypeParser -> TypeEntryFactory -> TypeRegistry
 */
export class TypeBuilder {
    private readonly reader = new TypeDocumentReader();
    private readonly factory = new TypeEntryFactory();

    public constructor(private readonly registry: TypeRegistry) {
    }

    /**
     * Full workspace indexing.
     * Повне будування індексу.
     * Будує індекс класів з PSR-4 roots
     * Build type registry from PSR-4 roots
     */
    public async build(source: TypeIndexSource): Promise<void> {
        this.registry.clear();
        for await (const sourceEntry of source.entries()) {
            await this.buildFile(sourceEntry.file);
        }
        console.log(`Indexed PHP types: ${this.registry.size()}`);
    }

    /**
     * Rebuild single PHP file.
     * Індексує один PHP-файл.
     * Index a single PHP file.
     */
    public async buildFile(file: string): Promise<void> {
        this.registry.removeByFile(file);
        const document = await this.reader.read(file);
        const lexer = new PhpLexer(document.content);
        const stream =new PhpTokenStream(lexer);
        const parser = new PhpTypeParser(stream);
        const phpTypes = parser.parse();
        for (const phpType of phpTypes) {
            this.registry.add( this.factory.create(document.file, phpType) );
        }
    }

    public removeFile(file: string): void {
        this.registry.removeByFile(file);
        console.log(`[Index] Removed ${file}`);
    }
}