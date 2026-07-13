import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { DiIndex } from "../index/DiIndex";

export class DefinitionResolver
{
    constructor(
        private registry: TypeRegistry,
        private diIndex: DiIndex
    ) {}

    public async resolve(
        value: string
    ): Promise<vscode.Location | undefined>
    {
        //
        // PHP class
        //
        const classEntry = this.registry.find(value);

        if (classEntry) {

            const doc = await vscode.workspace.openTextDocument(classEntry.uri);

            return new vscode.Location(
                classEntry.uri,
                doc.positionAt(classEntry.offset)
            );

        }

        //
        // VirtualType
        //
        const virtualType = this.diIndex.findVirtualType(value);

        if (virtualType) {

            const doc = await vscode.workspace.openTextDocument(virtualType.uri);

            return new vscode.Location(
                virtualType.uri,
                doc.positionAt(virtualType.offset)
            );

        }

        //
        // Preference
        //
        const preferences = this.diIndex.findPreferences(value);

        if (preferences.length > 0) {

            const preference = preferences[0];

            const doc = await vscode.workspace.openTextDocument(preference.uri);

            return new vscode.Location(
                preference.uri,
                doc.positionAt(preference.offset)
            );

        }

        return;
    }
}