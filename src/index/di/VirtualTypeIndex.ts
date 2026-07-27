import * as vscode from "vscode";

export interface VirtualTypeReference
{
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export interface VirtualTypeEntry
{
    name: string;
    type: string;

    uri: vscode.Uri;
    offset: number;
    length: number;

    references: VirtualTypeReference[];
}

export class VirtualTypeIndex
{
    private readonly map = new Map<string, VirtualTypeEntry>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: VirtualTypeEntry
    ): void
    {
        this.map.set(
            entry.name,
            entry
        );
    }

    public addReference(
        name: string,
        reference: VirtualTypeReference
    ): void
    {
        const entry = this.map.get(name);

        if (!entry) {
            return;
        }

        entry.references.push(reference);
    }

    public find(
        name: string
    ): VirtualTypeEntry | undefined
    {
        return this.map.get(name);
    }

    public has(
        name: string
    ): boolean
    {
        return this.map.has(name);
    }

    public size(): number
    {
        return this.map.size;
    }

    public values(): IterableIterator<VirtualTypeEntry>
    {
        return this.map.values();
    }
}