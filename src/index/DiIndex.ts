import * as vscode from "vscode";
import { XmlScanner, XmlNode } from "../parser/XmlScanner";

export type DiKind =
    | "type"
    | "preference"
    | "virtualType"
    | "plugin";

export interface DiReference {
    className: string;
    kind: DiKind;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class DiIndex 
{
    private readonly map = new Map<string, DiReference[]>();
    private readonly scanner = new XmlScanner();

    public async build(): Promise<void> {
        this.map.clear();

        const files = await vscode.workspace.findFiles("**/etc/**/di.xml");
        console.log(`Scanning ${files.length} di.xml files`);

        for (const file of files) {
            const doc = await vscode.workspace.openTextDocument(file);
            const nodes = this.scanner.scanDi(doc.getText(), file);
            for (const node of nodes) {
                this.consume(node);
            }
        }

        console.log(`DI entries: ${this.map.size}`);
        // console.log("SAMPLE KEYS:", Array.from(this.map.keys()).slice(0, 20));
    }

    public find(className: string): DiReference[] {
        return this.map.get(className) ?? [];
    }

    public findByShortName(short: string): DiReference[] {
        const result: DiReference[] = [];
        for (const [key, values] of this.map) {
            if (key.endsWith("\\" + short)) {
                result.push(...values);
            }
        }

        return result;
    }

    private consume(node: XmlNode) {
        let className: string | undefined;
        let kind: DiKind = "type";

        if (node.name === "type") {
            className = node.attributes.get("name");
            kind = "type";
        }

        if (node.name === "preference") {
            className = node.attributes.get("for");
            kind = "preference";
        }

        if (node.name === "virtualType") {
            className = node.attributes.get("type");
            kind = "virtualType";
        }

        if (node.name === "plugin") {
            className = node.attributes.get("type");
            kind = "plugin";
        }

        if (!className) {
            return;
        }

        const list = this.map.get(className) ?? [];
// console.log("NODE:", node.name, className);
        list.push({
            className,
            kind,
            uri: node.uri,
            offset: node.offset,
            length: node.length
        });

        this.map.set(className, list);
    }
}