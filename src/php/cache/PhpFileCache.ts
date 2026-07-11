import { PhpFile } from "../ast/PhpFile";

/**
 * Stores parsed PHP files.
 *
 * file
 *   ↓
 * PhpFile
 */
export class PhpFileCache {
    private readonly map = new Map<string, PhpFile>();

    /**
     * Removes all cached files.
     */
    public clear(): void {
        this.map.clear();
    }

    /**
     * Stores parsed file.
     */
    public set(file: string, phpFile: PhpFile): void {
        this.map.set(file, phpFile);
    }

    /**
     * Returns parsed file.
     */
    public get(file: string): PhpFile | undefined {
        return this.map.get(file);
    }

    /**
     * Removes cached file.
     */
    public remove(file: string): boolean {
        return this.map.delete(file);
    }

    /**
     * Checks whether file is cached.
     */
    public has(file: string): boolean {
        return this.map.has(file);
    }

    /**
     * Returns all cached files.
     */
    public values(): IterableIterator<PhpFile> {
        return this.map.values();
    }

    /**
     * Number of cached files.
     */
    public size(): number {
        return this.map.size;
    }
}