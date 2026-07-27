import * as vscode from "vscode";

import { DiIndex } from "../index/DiIndex";
import { TypeRegistry } from "../index/TypeRegistry";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";

import { IDefinitionStrategy } from "./IDefinitionStrategy";

import { PhpClassDefinitionStrategy } from "./definition/PhpClassDefinitionStrategy";
import { VirtualTypeDefinitionStrategy } from "./definition/VirtualTypeDefinitionStrategy";
import { PreferenceDefinitionStrategy } from "./definition/PreferenceDefinitionStrategy";
import { PluginDefinitionStrategy } from "./definition/PluginDefinitionStrategy";
import { ObserverDefinitionStrategy } from "./definition/ObserverDefinitionStrategy";

import { PhpMemberResolver } from "../php/resolver/PhpMemberResolver";
import { DocumentManager } from "../vscode/DocumentManager";
import { ObjectResolver } from "./ObjectResolver";

export class DefinitionResolver
{
    private readonly strategies: IDefinitionStrategy[];

    constructor(
        registry: TypeRegistry,
        private readonly objectResolver: ObjectResolver,
        private readonly diIndex: DiIndex,
        private readonly memberResolver: PhpMemberResolver,
        private readonly documents: DocumentManager
    ) {
        this.strategies = [
            new PreferenceDefinitionStrategy(
                registry,
                diIndex
            ),
            new VirtualTypeDefinitionStrategy(
                registry,
                diIndex
            ),
            new PluginDefinitionStrategy(
                registry,
                diIndex
            ),
            new ObserverDefinitionStrategy(
                registry,
                diIndex
            ),
            new PhpClassDefinitionStrategy(
                registry,
                diIndex
            )
        ];
    }

    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        for (const strategy of this.strategies) {

            console.log(
                "TRY:",
                strategy.constructor.name,
                match.tag,
                match.attribute,
                match.value
            );

            const location =
                await strategy.resolve(match);

            console.log(
                "RESULT:",
                strategy.constructor.name,
                location
            );

            if (location) {
                return location;
            }
        }

        return;
    }

    public async resolveArgument(
        ownerClass: string,
        parameterName: string
    ): Promise<vscode.Location | undefined>
    {
        const constructor =
            this.memberResolver.resolveMethod(
                ownerClass,
                "__construct"
            );

        if (!constructor) {
            return;
        }

        const parameter =
            constructor.parameters?.find(
                p => p.name === parameterName
            );

        if (!parameter) {
            return;
        }

        return new vscode.Location(
            constructor.uri,
            await this.documents.position(
                constructor.uri,
                parameter.offset
            )
        );
    }

    public async resolveObjectValue(
        name: string
    ): Promise<vscode.Location | undefined>
    {
        return this.objectResolver.resolve(name);
    }
}