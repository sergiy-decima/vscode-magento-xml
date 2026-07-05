import { IndexedClass } from "./IndexedClass";

/**
 * зберігає дані
 */
export class ClassIndex 
{
    private readonly map = new Map<string, IndexedClass>();

    public clear(): void {
        this.map.clear();
    }

    public add(clazz: IndexedClass): void {
        this.map.set(clazz.fqcn, clazz);
    }

    public has(fqcn: string): boolean {
        return this.map.has(fqcn);
    }

    public find(fqcn: string): IndexedClass | undefined {
        return this.map.get(fqcn);
    }

    public all(): readonly IndexedClass[] {
        return [...this.map.values()];
    }

    public entries(): IterableIterator<[string, IndexedClass]> {
        return this.map.entries();
    }

    public values(): IterableIterator<IndexedClass> {
        return this.map.values();
    }

    /**
     * Total number of indexed classes
     *
     * @returns {number}
     */
    public size(): number {
        return this.map.size;
    }
}