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
            this.collectVirtualTypeReferences(document.root);
        }

        const stats = this.index.stats();

        console.log(`DI entries: ${stats.references}`);
        console.log(`Preferences: ${stats.preferences}`);
        console.log(`VirtualTypes: ${stats.virtualTypes}`);
        console.log(`Types: ${stats.types}`);
        console.log(`Plugin targets: ${stats.plugins}`);
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
        //
        // Спочатку індексуємо використання virtualType:
        //
        // <argument xsi:type="object">orderConfig</argument>
        // <item xsi:type="object">orderConfig</item>
        //
        if (
            (node.name === "argument" || node.name === "item") &&
            node.attribute("xsi:type")?.value === "object"
        ) {
            const objectName = node.text.trim();

            if (objectName.length > 0) {

                this.index.addVirtualTypeReference(
                    objectName,
                    {
                        uri: node.uri,
                        offset: node.textOffset,
                        length: node.textLength
                    }
                );
            }

            return;
        }

        let className: string | undefined;
        let kind: DiKind = "type";

        let offset = node.offset;
        let length = node.length;

        switch (node.name) {

            case "type": {

                const name =
                    node.attribute("name");

                if (!name) {
                    return;
                }

                offset = name.offset;
                length = name.length;

                this.index.addType({
                    name: name.value,
                    uri: node.uri,
                    offset,
                    length
                });

                className = name.value;
                kind = "type";

                break;
            }

            case "preference": {

                const forAttribute =
                    node.attribute("for");

                const typeAttribute =
                    node.attribute("type");

                if (
                    !forAttribute ||
                    !typeAttribute
                ) {
                    return;
                }

                offset = forAttribute.offset;
                length = forAttribute.length;

                this.index.addPreference({
                    for: forAttribute.value,
                    type: typeAttribute.value,
                    uri: node.uri,
                    offset,
                    length
                });

                className = forAttribute.value;
                kind = "preference";

                break;
            }

            case "virtualType": {

                const name =
                    node.attribute("name");

                const type =
                    node.attribute("type");

                if (
                    !name ||
                    !type
                ) {
                    return;
                }

                offset = name.offset;
                length = name.length;

                this.index.addVirtualType({
                    name: name.value,
                    type: type.value,
                    uri: node.uri,
                    offset,
                    length,
                    references: []
                });

                className = name.value;
                kind = "virtualType";

                break;
            }

            case "plugin": {

                const target =
                    node.attribute("type");

                const plugin =
                    node.attribute("name");

                if (
                    !target ||
                    !plugin
                ) {
                    return;
                }

                offset = target.offset;
                length = target.length;

                this.index.addPlugin({
                    name: plugin.value,
                    type: target.value,
                    plugin: plugin.value,
                    uri: node.uri,
                    offset,
                    length
                });

                className = target.value;
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
            offset,
            length
        });
    }

    private collectVirtualTypeReferences(
        node: XmlNode
    ): void
    {
        if (
            (node.name === "argument" || node.name === "item") &&
            node.attribute("xsi:type")?.value === "object"
        ) {
            const value = node.text.trim();

            if (value.length > 0) {

                this.index.addVirtualTypeReference(
                    value,
                    {
                        uri: node.uri,
                        offset: node.textOffset,
                        length: value.length
                    }
                );
            }
        }

        for (const child of node.children) {
            this.collectVirtualTypeReferences(child);
        }
    }
}