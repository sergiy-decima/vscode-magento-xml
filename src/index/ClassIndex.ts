import * as vscode from "vscode";
import { ClassIndexer } from "./ClassIndexer";
import { ComposerDiscovery } from "./ComposerDiscovery";
import { IndexedClass } from "./IndexedClass";

export interface PhpClass {
    fqcn: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

/**
 * зберігає дані
 */
export class ClassIndex 
{
    private readonly map = new Map<string, PhpClass>();
    private readonly discovery = new ComposerDiscovery();
    private readonly indexer = new ClassIndexer();

    /**
     * ComposerDiscovery → PSR-4 → ClassIndexer → ClassIndex
     */
    public async build(): Promise<void> {
        this.clear();
        const roots = await this.discovery.discover();
        console.log("PSR-4 roots:", roots.length);
        await this.indexer.build(roots, this);
        console.log(`Indexed classes: ${this.map.size}`);
    }

    public clear(): void {
        this.map.clear();
    }

    public add(clazz: IndexedClass): void {
        this.map.set(clazz.fqcn, {
            fqcn: clazz.fqcn,
            uri: vscode.Uri.file(clazz.file),
            offset: clazz.offset,
            length: clazz.length
        });
    }

    public has(fqcn: string): boolean {
        return this.map.has(fqcn);
    }

    public find(fqcn: string): PhpClass | undefined {
        return this.map.get(fqcn);
    }

    public all(): readonly PhpClass[] {
        return [...this.map.values()];
    }

    public entries(): IterableIterator<[string, PhpClass]> {
        return this.map.entries();
    }

    public values(): IterableIterator<PhpClass> {
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