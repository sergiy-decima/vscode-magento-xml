import * as vscode from "vscode";

export interface TypeEntry {
    name: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class TypeIndex
{
    private readonly map = new Map<string, TypeEntry[]>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: TypeEntry
    ): void
    {
        let list = this.map.get(entry.name);

        if (!list) {
            list = [];
            this.map.set(entry.name, list);
        }

        list.push(entry);
    }

    public find(
        name: string
    ): TypeEntry[]
    {
        return this.map.get(name) ?? [];
    }

    public findAll(
        name: string
    ): TypeEntry[]
    {
        return this.find(name);
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

    public *values(): IterableIterator<TypeEntry>
    {
        for (const list of this.map.values()) {
            yield* list;
        }
    }
}