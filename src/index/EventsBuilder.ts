import * as vscode from "vscode";
import { EventsIndex } from "./EventsIndex";
import { XmlScanner } from "../parser/XmlScanner";
import { XmlNode } from "../xml/XmlNode";

export class EventsBuilder
{
    private readonly scanner = new XmlScanner();

    constructor(
        private readonly index: EventsIndex
    ) {}

    public async build(): Promise<void>
    {
        this.index.clear();

        const files = await vscode.workspace.findFiles(
            "**/etc/**/events.xml"
        );

        for (const file of files) {

            const document = await vscode.workspace.openTextDocument(file);

            const nodes = this.scanner.scan(
                document.getText(),
                file,
                [
                    "event",
                    "observer"
                ]
            );

            this.consume(nodes);
        }

        this.index.logSize();
    }

    private consume(
        nodes: XmlNode[]
    ): void
    {
        let currentEvent: string | undefined;

        for (const node of nodes) {

            if (node.name === "event") {

                const name = node.attribute("name")?.value;

                if (!name) {
                    continue;
                }

                currentEvent = name;

                this.index.addEvent({
                    name,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                continue;
            }

            if (
                node.name === "observer" &&
                currentEvent
            ) {

                const observerName =
                    node.attribute("name")?.value;

                const instance =
                    node.attribute("instance")?.value;

                if (!observerName || !instance) {
                    continue;
                }

                this.index.addObserver({
                    event: currentEvent,
                    name: observerName,
                    instance,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });
            }
        }
    }
}