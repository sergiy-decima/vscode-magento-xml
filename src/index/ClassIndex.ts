import * as vscode from "vscode";
import { ClassIndexer } from "./ClassIndexer";
import { ComposerDiscovery } from "./ComposerDiscovery";

export interface PhpClass {
    fqcn: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

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
        await this.indexer.build(roots, this);
        console.log(`Indexed classes: ${this.map.size}`);
    }

    public clear(): void {
        this.map.clear();
    }

    public add(phpClass: PhpClass): void {
        this.map.set(phpClass.fqcn, phpClass);
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