import * as vscode from "vscode";
import { TypeRegistry } from "../index/TypeRegistry";
import { DiIndex } from "../index/DiIndex";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { IDefinitionStrategy } from "./IDefinitionStrategy";
import { PhpClassDefinitionStrategy } from "./PhpClassDefinitionStrategy";
import { VirtualTypeDefinitionStrategy } from "./VirtualTypeDefinitionStrategy";
import { PreferenceDefinitionStrategy } from "./PreferenceDefinitionStrategy";
import { PluginDefinitionStrategy } from "./PluginDefinitionStrategy";

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