import { TypeRegistry } from "./TypeRegistry";
import { TypeEntryFactory } from "./TypeEntryFactory";
import { TypeDocumentReader } from "./TypeDocumentReader";
import { TypeIndexSource } from "./TypeIndexSource";
import { PhpLexer } from "../php/lexer/PhpLexer";
import { PhpTokenStream } from "../php/parser/PhpTokenStream";
import { PhpFileParser } from "../php/parser/PhpFileParser";
import { PhpFileCache } from "../php/cache/PhpFileCache";

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

    public constructor(
        private readonly registry: TypeRegistry,
        private readonly fileCache: PhpFileCache
    ) {
    }

    /**
     * Full workspace indexing.
     * Повне будування індексу.
     * Будує індекс класів з PSR-4 roots
     * Build type registry from PSR-4 roots
     */
    public async build(source: TypeIndexSource): Promise<void> {
        this.registry.clear();
        this.fileCache.clear();
        for await (const sourceEntry of source.entries()) {
            await this.buildFile(sourceEntry.file);
        }
        console.log(`Indexed PHP types: ${this.registry.size()}`);
        console.log(`File cache size: ${this.fileCache.size()}`);
    }

    /**
     * Rebuild single PHP file.
     * Індексує один PHP-файл.
     * Index a single PHP file.
     */
    public async buildFile(file: string): Promise<void> {
        const document = await this.reader.read(file);
        const lexer = new PhpLexer(document.content);
        const stream =new PhpTokenStream(lexer);
        const parser = new PhpFileParser(stream);
        const phpFile = parser.parse();

        for (const type of phpFile.types) {
            if ('Magento\\Framework\\App\\Request\\Http' == type.fqcn) {
            console.log("TYPE:", type.fqcn);
            console.log("EXTENDS:", type.extends);
            console.log("IMPLEMENTS:", type.implements);
            }
        }

        this.fileCache.set(document.file, phpFile);
        for (const phpType of phpFile.types) {
            this.registry.add( this.factory.create(document.file, phpType) );
            
            // console.log(phpType);

            // console.log("CLASS:", phpType.fqcn);
            // for (const property of phpType.properties) {
            //     console.log(
            //         "PROPERTY:",
            //         property.visibility,
            //         property.type,
            //         property.name
            //     );
            // }
            // for (const method of phpType.methods) {
            //     console.log(
            //         "METHOD:",
            //         method.visibility,
            //         method.isStatic,
            //         method.name,
            //         "return:",
            //         method.returnType
            //     );
            //     for (const param of method.parameters) {
            //         console.log(
            //             "PARAM:",
            //             param.type,
            //             param.name
            //         );
            //     }
            // }
        }
    }

    public removeFile(file: string): void {
        this.registry.removeByFile(file);
        this.fileCache.remove(file);
        console.log(`[Index] Deleted ${file}`);
    }
}