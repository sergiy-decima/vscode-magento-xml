import * as vscode from "vscode";

interface EventLocation
{
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export interface EventEntry extends EventLocation
{
    name: string;
}

export interface ObserverEntry extends EventLocation
{
    event: string;
    name: string;
    instance: string;
}

export class EventsIndex
{
    private readonly events = new Map<string, EventEntry>();

    private readonly observersByEvent =
        new Map<string, ObserverEntry[]>();

    private readonly observersByInstance =
        new Map<string, ObserverEntry[]>();

    public clear(): void
    {
        this.events.clear();
        this.observersByEvent.clear();
        this.observersByInstance.clear();
    }

    public addEvent(
        entry: EventEntry
    ): void
    {
        this.events.set(entry.name, entry);
    }

    public addObserver(
        entry: ObserverEntry
    ): void
    {
        //
        // event -> observers
        //
        let eventList = this.observersByEvent.get(entry.event);

        if (!eventList) {
            eventList = [];
            this.observersByEvent.set(entry.event, eventList);
        }

        eventList.push(entry);

        //
        // instance -> observers
        //
        let instanceList = this.observersByInstance.get(entry.instance);

        if (!instanceList) {
            instanceList = [];
            this.observersByInstance.set(
                entry.instance,
                instanceList
            );
        }

        instanceList.push(entry);
    }

    public findEvent(
        name: string
    ): EventEntry | undefined
    {
        return this.events.get(name);
    }

    public findObservers(
        event: string
    ): ObserverEntry[]
    {
        return this.observersByEvent.get(event) ?? [];
    }

    public findByInstance(
        instance: string
    ): ObserverEntry[]
    {
        return this.observersByInstance.get(instance) ?? [];
    }

    public size(): number
    {
        return this.events.size;
    }

    public logSize(): void
    {
        console.log(
            `Events: ${this.events.size}`
        );

        console.log(
            `Observer classes: ${this.observersByInstance.size}`
        );
    }
}