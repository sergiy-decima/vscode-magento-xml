import * as vscode from "vscode";

export interface PluginEntry
{
    name: string;
    type: string;
    plugin: string;

    uri: vscode.Uri;
    offset: number;
    length: number;
}

// export interface PluginEntry extends DiLocation {
//     name: string;
//     type: string;
//     plugin: string;
// }

export class PluginIndex
{
    private readonly map = new Map<string, PluginEntry[]>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: PluginEntry
    ): void
    {
        let list = this.map.get(entry.type);

        if (!list) {
            list = [];
            this.map.set(entry.type, list);
        }

        list.push(entry);
    }

    public find(
        type: string
    ): PluginEntry[]
    {
        return this.map.get(type) ?? [];
    }

    public size(): number
    {
        return this.map.size;
    }
}