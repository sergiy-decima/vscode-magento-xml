import * as vscode from "vscode";

export interface TypeEntry {
    name: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class TypeIndex
{
    private readonly map = new Map<string, TypeEntry>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: TypeEntry
    ): void
    {
        this.map.set(entry.name, entry);
    }

    public find(
        name: string
    ): TypeEntry | undefined
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

    public values(): IterableIterator<TypeEntry>
    {
        return this.map.values();
    }
}