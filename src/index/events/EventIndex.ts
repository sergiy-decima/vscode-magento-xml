import { EventEntry } from "./EventEntry";

export class EventIndex
{
    private readonly map = new Map<string, EventEntry>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: EventEntry
    ): void
    {
        this.map.set(entry.name, entry);
    }

    public find(
        name: string
    ): EventEntry | undefined
    {
        return this.map.get(name);
    }

    public has(
        name: string
    ): boolean
    {
        return this.map.has(name);
    }

    public values(): IterableIterator<EventEntry>
    {
        return this.map.values();
    }

    public size(): number
    {
        return this.map.size;
    }
}