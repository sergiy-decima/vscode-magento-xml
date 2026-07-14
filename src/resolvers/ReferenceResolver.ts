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

        for (const reference of this.diIndex.find(className)) {

            const doc = await vscode.workspace.openTextDocument(
                reference.uri
            );

            result.push(
                new vscode.Location(
                    reference.uri,
                    doc.positionAt(reference.offset)
                )
            );
        }

        return result;
    }
}