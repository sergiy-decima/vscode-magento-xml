import * as vscode from "vscode";
import { XmlNode, XmlScanner } from "../parser/XmlScanner";
import { DiIndex } from "./DiIndex";
import { DiKind } from "./di/DiReferenceIndex";

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

            const name = node.attributes.get("name");

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

            const forClass = node.attributes.get("for");
            const typeClass = node.attributes.get("type");

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

            const name = node.attributes.get("name");
            const type = node.attributes.get("type");

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

            const target = node.attributes.get("type");
            const plugin = node.attributes.get("name");

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