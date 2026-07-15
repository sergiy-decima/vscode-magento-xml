import * as vscode from "vscode";
import { DiIndex } from "../index/DiIndex";

export class ReferenceResolver
{
    constructor(
        private readonly diIndex: DiIndex
    ) {}

    public async resolve(
        className: string
    ): Promise<vscode.Location[]>
    {
        const result: vscode.Location[] = [];

        result.push(
            ...await this.toLocations(
                this.diIndex.findPreferences(className)
            )
        );

        result.push(
            ...await this.toLocations(
                this.diIndex.findPlugins(className)
            )
        );

        const virtualType =
            this.diIndex.findVirtualType(className);

        if (virtualType) {

            result.push(
                ...await this.toLocations([virtualType])
            );

        }

        result.push(
            ...await this.toLocations(
                this.diIndex.findTypes(className)
            )
        );

        return result;
    }

    private async toLocations(
        entries: Iterable<{
            uri: vscode.Uri;
            offset: number;
        }>
    ): Promise<vscode.Location[]>
    {
        const result: vscode.Location[] = [];

        for (const entry of entries) {

            const doc = await vscode.workspace.openTextDocument(
                entry.uri
            );

            result.push(
                new vscode.Location(
                    entry.uri,
                    doc.positionAt(entry.offset)
                )
            );
        }

        return result;
    }
}