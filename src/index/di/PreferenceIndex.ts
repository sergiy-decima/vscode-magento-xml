import * as vscode from "vscode";

export interface PreferenceEntry
{
    for: string;
    type: string;

    uri: vscode.Uri;
    offset: number;
    length: number;
}

// export interface PreferenceEntry extends DiLocation {
//     for: string;
//     type: string;
// }

export class PreferenceIndex
{
    private readonly map = new Map<string, PreferenceEntry[]>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(entry: PreferenceEntry): void
    {
        let list = this.map.get(entry.for);

        if (!list) {
            list = [];
            this.map.set(entry.for, list);
        }

        list.push(entry);
    }

    public find(className: string): PreferenceEntry[]
    {
        return this.map.get(className) ?? [];
    }

    public size(): number
    {
        return this.map.size;
    }
}