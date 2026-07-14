import * as vscode from "vscode";

export interface VirtualTypeEntry
{
    name: string;
    type: string;

    uri: vscode.Uri;
    offset: number;
    length: number;
}

// export interface VirtualTypeEntry extends DiLocation {
//     name: string;
//     type: string;
// }

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
        this.map.set(entry.name, entry);
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