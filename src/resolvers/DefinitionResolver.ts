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

export class DefinitionResolver
{
    private readonly strategies: IDefinitionStrategy[];

    constructor(
        registry: TypeRegistry,
        diIndex: DiIndex
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
}