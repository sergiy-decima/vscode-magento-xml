import * as vscode from "vscode";
import { XmlScanner } from "../parser/XmlScanner";
import { DiIndex } from "./DiIndex";
import { DiKind } from "./di/DiReferenceIndex";
import { XmlNode } from "../xml/XmlNode";

export class DiBuilder
{
    private readonly scanner = new XmlScanner();

    constructor(
        private readonly index: DiIndex
    ) {}

    public async build(): Promise<void>
    {
        this.index.clear();
        const files = await vscode.workspace.findFiles("**/etc/**/di.xml");

        console.log(`Scanning ${files.length} di.xml files`);

        for (const file of files) {
            const document = await vscode.workspace.openTextDocument(file);
            const nodes = this.scanner.scan(
                document.getText(),
                file,
                [
                    "type",
                    "preference",
                    "virtualType",
                    "plugin"
                ]
            );

            for (const node of nodes) {
                this.consume(node);
            }

        }

        const stats = this.index.stats();
        console.log(`DI entries: ${stats.references}`);
        console.log(`Preferences: ${stats.preferences}`);
        console.log(`VirtualTypes: ${stats.virtualTypes}`);
        console.log(`Types: ${stats.types}`);
        console.log(`Plugin targets: ${stats.plugins}`);
    }

    private consume(
        node: XmlNode
    ): void
    {
        let className: string | undefined;
        let kind: DiKind = "type";

        if (node.name === "type") {

            const name = node.attribute("name")?.value;

            if (name) {

                this.index.addType({
                    name,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = name;
                kind = "type";
            }
        }

        if (node.name === "preference") {

            const forClass = node.attribute("for")?.value;
            const typeClass = node.attribute("type")?.value;

            if (forClass && typeClass) {

                this.index.addPreference({
                    for: forClass,
                    type: typeClass,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = forClass;
                kind = "preference";
            }
        }

        if (node.name === "virtualType") {

            const name = node.attribute("name")?.value;
            const type = node.attribute("type")?.value;

            if (name && type) {

                this.index.addVirtualType({
                    name,
                    type,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = name;
                kind = "virtualType";
            }
        }

        if (node.name === "plugin") {

            const target = node.attribute("type")?.value;
            const plugin = node.attribute("name")?.value;

            if (target && plugin) {

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
            }
        }

        if (!className) {
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