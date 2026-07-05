import { TypeEntry } from "./TypeEntry";

/**
 * зберігає знайдені типи - сховище
 */
export class TypeRegistry 
{
    private readonly map = new Map<string, TypeEntry>();

    public clear(): void {
        this.map.clear();
    }

    public add(entry: TypeEntry): void {
        this.map.set(entry.fqcn, entry);
    }

    public has(fqcn: string): boolean {
        return this.map.has(fqcn);
    }

    public find(fqcn: string): TypeEntry | undefined {
        return this.map.get(fqcn);
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