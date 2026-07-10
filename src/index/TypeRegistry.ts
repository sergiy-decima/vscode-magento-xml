import { TypeEntry } from "./TypeEntry";

/**
 * Зберігає індекс
 * Зберігає знайдені типи - сховище
 */
export class TypeRegistry 
{
    private readonly map = new Map<string, TypeEntry>();
    private readonly fileMap = new Map<string, Set<string>>();

    public clear(): void {
        this.map.clear();
        this.fileMap.clear();
    }

    public add(entry: TypeEntry): void {
        this.map.set(entry.fqcn, entry);
        let types = this.fileMap.get(entry.file);
        if (!types) {
            types = new Set<string>();
            this.fileMap.set(entry.file, types);
        }
        types.add(entry.fqcn);
    }

    public has(fqcn: string): boolean {
        return this.map.has(fqcn);
    }

    public hasFile(file: string): boolean {
        return this.fileMap.has(file);
    }

    public find(fqcn: string): TypeEntry | undefined {
        return this.map.get(fqcn);
    }

    public findByFile(file: string): TypeEntry[] {
        const types = this.fileMap.get(file);
        if (!types) {
            return [];
        }

        return [...types]
            .map( fqcn => this.map.get(fqcn) )
            .filter( (type): type is TypeEntry => type !== undefined );
    }

    public remove(fqcn: string): boolean {
        const entry = this.map.get(fqcn);
        if (!entry) {
            return false;
        }
        
        this.map.delete(fqcn);

        const types = this.fileMap.get(entry.file);
        types?.delete(fqcn);
        if (types?.size === 0) {
            this.fileMap.delete(entry.file);
        }

        return true;
    }

    public removeByFile(file: string): void {
        const types = this.fileMap.get(file);
        if (!types) {
            return;
        }

        for (const fqcn of types) {
            this.map.delete(fqcn);
        }
        this.fileMap.delete(file);
    }

    public all(): readonly TypeEntry[] {
        return [...this.map.values()];
    }

    public entries(): IterableIterator<[string, TypeEntry]> {
        return this.map.entries();
    }

    public values(): IterableIterator<TypeEntry> {
        return this.map.values();
    }

    /**
     * Total number of indexed types - entities
     *
     * @returns {number}
     */
    public size(): number {
        return this.map.size;
    }

    /**
     * @returns 
     */
    public files(): IterableIterator<string> {
        return this.fileMap.keys();
    }
}