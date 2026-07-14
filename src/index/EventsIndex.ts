import { EventEntry } from "./events/EventEntry";
import { EventIndex } from "./events/EventIndex";
import { ObserverEntry } from "./events/ObserverEntry";
import { ObserverIndex } from "./events/ObserverIndex";

export class EventsIndex
{
    private readonly events = new EventIndex();

    private readonly observers = new ObserverIndex();

    public clear(): void
    {
        this.events.clear();
        this.observers.clear();
    }

    public addEvent(
        entry: EventEntry
    ): void
    {
        this.events.add(entry);
    }

    public addObserver(
        entry: ObserverEntry
    ): void
    {
        this.observers.add(entry);
    }

    public findEvent(
        name: string
    ): EventEntry | undefined
    {
        return this.events.find(name);
    }

    public findObservers(
        event: string
    ): ObserverEntry[]
    {
        return this.observers.find(event);
    }

    public logSize(): void
    {
        console.log(`Events: ${this.events.size()}`);
        console.log(`Observers: ${this.observers.size()}`);
    }
}