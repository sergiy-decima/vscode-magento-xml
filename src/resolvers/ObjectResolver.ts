import * as vscode from "vscode";

import { DiIndex } from "../index/DiIndex";
import { TypeRegistry } from "../index/TypeRegistry";
import { DocumentManager } from "../vscode/DocumentManager";

export class ObjectResolver
{
    constructor(
        private readonly registry: TypeRegistry,
        private readonly diIndex: DiIndex,
        private readonly documents: DocumentManager
    ) {}

    public async resolve(
        name: string
    ): Promise<vscode.Location | undefined>
    {
        //
        // virtualType
        //
        const virtualType =
            this.diIndex.findVirtualType(name);

        if (virtualType) {

            return new vscode.Location(
                virtualType.uri,
                await this.documents.position(
                    virtualType.uri,
                    virtualType.offset
                )
            );

        }

        //
        // preference
        //
        const preferences =
            this.diIndex.findPreferences(name);

        if (preferences.length > 0) {

            return new vscode.Location(
                preferences[0].uri,
                await this.documents.position(
                    preferences[0].uri,
                    preferences[0].offset
                )
            );

        }

        //
        // plugin
        //
        const plugins =
            this.diIndex.findPlugins(name);

        if (plugins.length > 0) {

            return new vscode.Location(
                plugins[0].uri,
                await this.documents.position(
                    plugins[0].uri,
                    plugins[0].offset
                )
            );

        }

        //
        // PHP class
        //
        const type =
            this.registry.find(name);

        if (type) {

            return new vscode.Location(
                type.uri,
                await this.documents.position(
                    type.uri,
                    type.nameOffset
                )
            );

        }

        return;
    }
}