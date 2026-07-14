import * as vscode from "vscode";

export type DiKind =
    | "type"
    | "preference"
    | "virtualType"
    | "plugin";

export interface DiReference {
    className: string;
    kind: DiKind;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class DiReferenceIndex
{
     private readonly map = new Map<string, DiReference[]>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: DiReference
    ): void
    {
        let list = this.map.get(entry.className);

        if (!list) {
            list = [];
            this.map.set(entry.className, list);
        }

        list.push(entry);
    }

    public find(
        className: string
    ): DiReference[] 
    {
        return this.map.get(className) ?? [];
    }

    public has(
        className: string
    ): boolean
    {
        return this.map.has(className);
    }

    public size(): number
    {
        return this.map.size;
    }

    public entries(): IterableIterator<[string, DiReference[]]>
    {
        return this.map.entries();
    }
}