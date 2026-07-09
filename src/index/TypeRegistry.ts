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
    }

    public add(entry: TypeEntry): void {
        this.map.set(entry.fqcn, entry);
        if (entry.file) {
            let types = this.fileMap.get(entry.file);
            if (!types) {
                types = new Set<string>();
                this.fileMap.set(entry.file, types);
            }
            types.add(entry.fqcn);
        }
    }

    public has(fqcn: string): boolean {
        return this.map.has(fqcn);
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
        const type = this.map.get(fqcn);
        if (!type) {
            return false;
        }
        
        this.map.delete(fqcn);

        if (type.file) {
            const types = this.fileMap.get(type.file);
            if (types) {
                types.delete(fqcn);
                if (types.size === 0) {
                    this.fileMap.delete(type.file);
                }
            }
        }

        return true;
    }

    public removeByFile(file: string): number {
        const types = this.fileMap.get(file);
        if (!types) {
            return 0;
        }

        const fqcnList = [...types];
        for (const fqcn of fqcnList) {
            this.remove(fqcn);
        }

        return fqcnList.length;
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
}