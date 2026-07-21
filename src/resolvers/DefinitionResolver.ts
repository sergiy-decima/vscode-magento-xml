import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { DiIndex } from "../index/DiIndex";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { IDefinitionStrategy } from "./IDefinitionStrategy";
import { PhpClassDefinitionStrategy } from "./definition/PhpClassDefinitionStrategy";
import { VirtualTypeDefinitionStrategy } from "./definition/VirtualTypeDefinitionStrategy";
import { PreferenceDefinitionStrategy } from "./definition/PreferenceDefinitionStrategy";
import { PluginDefinitionStrategy } from "./definition/PluginDefinitionStrategy";
import { ObserverDefinitionStrategy } from "./definition/ObserverDefinitionStrategy";
import { PhpConstructorResolver } from "../php/resolver/PhpConstructorResolver";
import { DocumentManager } from "../vscode/DocumentManager";

export class DefinitionResolver
{
    private readonly strategies: IDefinitionStrategy[];

    constructor(
        private readonly registry: TypeRegistry,
        private readonly diIndex: DiIndex,
        private readonly constructorResolver: PhpConstructorResolver,
        private readonly documents: DocumentManager
    ) {
        this.strategies = [
            new PhpClassDefinitionStrategy(
                registry,
                diIndex
            ),
            new VirtualTypeDefinitionStrategy(
                registry,
                diIndex
            ),
            new PreferenceDefinitionStrategy(
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
            )
        ];
    }

    public async resolve(
        match: XmlAttributeMatch
    ): Promise<vscode.Location | undefined>
    {
        for (const strategy of this.strategies) {

            const location = await strategy.resolve(match);

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
        const parameter = this.constructorResolver.resolve(
            ownerClass,
            parameterName
        );

        if (!parameter) {
            return;
        }

        const type = this.registry.find(ownerClass);

        if (!type) {
            return;
        }

        return new vscode.Location(
            type.uri,
            await this.documents.position(
                type.uri,
                parameter.offset
            )
        );
    }
}