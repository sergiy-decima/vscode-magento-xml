import { ObserverEntry } from "./ObserverEntry";

export class ObserverIndex
{
    private readonly map = new Map<string, ObserverEntry[]>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: ObserverEntry
    ): void
    {
        let list = this.map.get(entry.event);

        if (!list) {
            list = [];
            this.map.set(entry.event, list);
        }

        list.push(entry);
    }

    public find(
        event: string
    ): ObserverEntry[]
    {
        return this.map.get(event) ?? [];
    }

    public has(
        event: string
    ): boolean
    {
        return this.map.has(event);
    }

    public size(): number
    {
        return this.map.size;
    }

    public values(): IterableIterator<ObserverEntry[]>
    {
        return this.map.values();
    }

    public entries(): IterableIterator<[string, ObserverEntry[]]>
    {
        return this.map.entries();
    }
}