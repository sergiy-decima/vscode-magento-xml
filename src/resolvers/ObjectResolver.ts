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
        console.log("========================================");
        console.log("[ObjectResolver] NAME:", JSON.stringify(name));

        //
        // virtualType
        //
        const virtualType =
            this.diIndex.findVirtualType(name);

        console.log(
            "[ObjectResolver] virtualType:",
            virtualType
        );

        if (virtualType) {

            const position =
                await this.documents.position(
                    virtualType.uri,
                    virtualType.offset
                );

            console.log(
                "[ObjectResolver] virtualType POSITION:",
                position.line,
                position.character
            );

            return new vscode.Location(
                virtualType.uri,
                position
            );
        }

        //
        // preference
        //
        const preferences =
            this.diIndex.findPreferences(name);

        console.log(
            "[ObjectResolver] preferences:",
            preferences.length
        );

        if (preferences.length > 0) {

            const preference = preferences[0];

            const position =
                await this.documents.position(
                    preference.uri,
                    preference.offset
                );

            console.log(
                "[ObjectResolver] preference POSITION:",
                position.line,
                position.character
            );

            return new vscode.Location(
                preference.uri,
                position
            );
        }

        //
        // plugin
        //
        const plugins =
            this.diIndex.findPlugins(name);

        console.log(
            "[ObjectResolver] plugins:",
            plugins.length
        );

        if (plugins.length > 0) {

            const plugin = plugins[0];

            const position =
                await this.documents.position(
                    plugin.uri,
                    plugin.offset
                );

            console.log(
                "[ObjectResolver] plugin POSITION:",
                position.line,
                position.character
            );

            return new vscode.Location(
                plugin.uri,
                position
            );
        }

        //
        // PHP class
        //
        const type =
            this.registry.find(name);

        console.log(
            "[ObjectResolver] registry.find:",
            type
        );

        if (type) {

            const document =
                await this.documents.open(type.uri);

            const start =
                document.positionAt(
                    type.nameOffset
                );

            const end =
                document.positionAt(
                    type.nameOffset +
                    type.nameLength
                );

            console.log(
                "[ObjectResolver] FOUND:",
                type.fqcn,
                type.file
            );

            console.log(
                "[ObjectResolver] NAME OFFSET:",
                type.nameOffset
            );

            console.log(
                "[ObjectResolver] NAME LENGTH:",
                type.nameLength
            );

            console.log(
                "[ObjectResolver] START:",
                start.line,
                start.character
            );

            console.log(
                "[ObjectResolver] END:",
                end.line,
                end.character
            );

            console.log(
                "[ObjectResolver] SOURCE TEXT:",
                JSON.stringify(
                    document.getText(
                        new vscode.Range(start, end)
                    )
                )
            );

            const location =
                new vscode.Location(
                    type.uri,
                    new vscode.Range(
                        start,
                        end
                    )
                );

            console.log(
                "[ObjectResolver] LOCATION:",
                location
            );

            console.log("========================================");

            return location;
        }

        console.log(
            "[ObjectResolver] NOT FOUND"
        );

        console.log("========================================");

        return;
    }
}