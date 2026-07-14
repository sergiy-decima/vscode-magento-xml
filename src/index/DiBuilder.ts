import * as vscode from "vscode";
import { XmlNode, XmlScanner } from "../parser/XmlScanner";
import { DiIndex } from "./DiIndex";

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

        this.index.logSize();
    }

    private consume(node: XmlNode): void
    {
        this.index.consume(node);
    }
}