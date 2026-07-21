import * as vscode from "vscode";

import { DiIndex } from "./DiIndex";
import { DiKind } from "./di/DiReferenceIndex";

import { XmlDocumentReader } from "../xml/XmlDocumentReader";
import { XmlFileCache } from "../xml/cache/XmlFileCache";

import { XmlLexer } from "../xml/lexer/XmlLexer";
import { XmlTokenStream } from "../xml/parser/XmlTokenStream";
import { XmlDocumentParser } from "../xml/parser/XmlDocumentParser";

import { XmlNode } from "../xml/ast/XmlNode";

export class DiBuilder
{
    private readonly reader = new XmlDocumentReader();

    constructor(
        private readonly index: DiIndex,
        private readonly cache: XmlFileCache
    ) {}

    public async build(): Promise<void>
    {
        this.index.clear();
        this.cache.clear();

        const files =
            await vscode.workspace.findFiles(
                "**/etc/**/di.xml"
            );

        console.log(
            `Scanning ${files.length} di.xml files`
        );

        for (const file of files) {

            const xml =
                await this.reader.read(file.fsPath);

            const lexer =
                new XmlLexer(xml);

            const stream =
                new XmlTokenStream(lexer);

            const parser =
                new XmlDocumentParser(
                    stream,
                    file
                );

            const document =
                parser.parse();

            this.cache.set(
                file.fsPath,
                document
            );

            this.walk(document.root);
        }

        const stats = this.index.stats();

        console.log(
            `DI entries: ${stats.references}`
        );

        console.log(
            `Preferences: ${stats.preferences}`
        );

        console.log(
            `VirtualTypes: ${stats.virtualTypes}`
        );

        console.log(
            `Types: ${stats.types}`
        );

        console.log(
            `Plugin targets: ${stats.plugins}`
        );
    }

    private walk(
        node: XmlNode
    ): void
    {
        this.consume(node);

        for (const child of node.children) {
            this.walk(child);
        }
    }

        private consume(
        node: XmlNode
    ): void
    {
        let className: string | undefined;
        let kind: DiKind = "type";

        switch (node.name) {

            case "type": {

                const name =
                    node.attribute("name")?.value;

                if (!name) {
                    return;
                }

                this.index.addType({
                    name,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = name;
                kind = "type";

                break;
            }

            case "preference": {

                const forClass =
                    node.attribute("for")?.value;

                const typeClass =
                    node.attribute("type")?.value;

                if (
                    !forClass ||
                    !typeClass
                ) {
                    return;
                }

                this.index.addPreference({
                    for: forClass,
                    type: typeClass,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = forClass;
                kind = "preference";

                break;
            }

            case "virtualType": {

                const name =
                    node.attribute("name")?.value;

                const type =
                    node.attribute("type")?.value;

                if (
                    !name ||
                    !type
                ) {
                    return;
                }

                this.index.addVirtualType({
                    name,
                    type,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = name;
                kind = "virtualType";

                break;
            }

            case "plugin": {

                const target =
                    node.attribute("type")?.value;

                const plugin =
                    node.attribute("name")?.value;

                if (
                    !target ||
                    !plugin
                ) {
                    return;
                }

                this.index.addPlugin({
                    name: plugin,
                    type: target,
                    plugin,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = target;
                kind = "plugin";

                break;
            }

            default:
                return;
        }

        this.index.addReference({
            className,
            kind,
            uri: node.uri,
            offset: node.offset,
            length: node.length
        });
    }
}