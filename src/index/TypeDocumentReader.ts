import * as fs from "node:fs/promises";
import { TypeDocument } from "./TypeDocument";

/**
 * Reads PHP source documents.
 * читає файл
 */
export class TypeDocumentReader {
    /**
     * Read PHP file.
     */
    public async read(file: string): Promise<TypeDocument> {
        return {
            file,
            content: await fs.readFile(file, "utf8")
        };
    }
}