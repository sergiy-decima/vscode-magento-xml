import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { DiIndex } from "../index/DiIndex";
import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";

export class XmlDefinitionProvider implements vscode.DefinitionProvider
{
    constructor(
        private registry: TypeRegistry,
        private diIndex: DiIndex
    ) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined>
    {
        const match = XmlAttributeResolver.resolve(document, position);

        if (!match) {
            return;
        }

        //
        // PHP class
        //
         // console.log("WORD =", match.value));
        const classEntry = this.registry.find(match.value);
        // console.log("FOUND =", classEntry);

        if (classEntry) {

            const doc = await vscode.workspace.openTextDocument(classEntry.uri);

            return new vscode.Location(
                classEntry.uri,
                doc.positionAt(classEntry.offset)
            );

        }

        //
        // virtualType
        //
        const virtualType = this.diIndex.findVirtualType(match.value);

        if (virtualType) {

            const doc = await vscode.workspace.openTextDocument(virtualType.uri);

            return new vscode.Location(
                virtualType.uri,
                doc.positionAt(virtualType.offset)
            );

        }

        //
        // preference
        //
        const preference = this.diIndex.findPreference(match.value);

        if (preference) {

            const doc = await vscode.workspace.openTextDocument(preference.uri);

            return new vscode.Location(
                preference.uri,
                doc.positionAt(preference.offset)
            );

        }

        return;
    }
}