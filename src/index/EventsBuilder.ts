import * as vscode from "vscode";

import { EventsIndex } from "./EventsIndex";

import { XmlDocumentReader } from "../xml/XmlDocumentReader";
import { XmlFileCache } from "../xml/cache/XmlFileCache";

import { XmlLexer } from "../xml/lexer/XmlLexer";
import { XmlTokenStream } from "../xml/parser/XmlTokenStream";
import { XmlDocumentParser } from "../xml/parser/XmlDocumentParser";

import { XmlNode } from "../xml/ast/XmlNode";

export class EventsBuilder
{
    private readonly reader = new XmlDocumentReader();

    constructor(
        private readonly index: EventsIndex,
        private readonly cache: XmlFileCache
    ) {}

    public async build(): Promise<void>
    {
        this.index.clear();

        const files = await vscode.workspace.findFiles(
            "**/etc/**/events.xml"
        );

        for (const file of files) {

            const xml = await this.reader.read(
                file.fsPath
            );

            const lexer = new XmlLexer(xml);

            const stream = new XmlTokenStream(
                lexer
            );

            const parser = new XmlDocumentParser(
                stream,
                file
            );

            const document = parser.parse();

            this.cache.set(
                file.fsPath,
                document
            );

            this.walk(
                document.root,
                undefined
            );
        }

        this.index.logSize();
    }

    private walk(
        node: XmlNode,
        currentEvent?: string
    ): void
    {
        if (node.name === "event") {

            const name =
                node.attribute("name")?.value;

            if (name) {

                currentEvent = name;

                this.index.addEvent({
                    name,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });
            }
        }

        if (
            node.name === "observer" &&
            currentEvent
        ) {

            const observerName =
                node.attribute("name")?.value;

            const instance =
                node.attribute("instance")?.value;

            if (
                observerName &&
                instance
            ) {

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

        for (const child of node.children) {
            this.walk(
                child,
                currentEvent
            );
        }
    }
}