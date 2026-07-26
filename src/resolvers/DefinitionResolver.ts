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
import { PhpMemberResolver } from "../php/resolver/PhpMemberResolver";
import { DocumentManager } from "../vscode/DocumentManager";
import { XmlValueMatch } from "../xml/XmlAttributeResolver";
import { XmlResolver } from "../xml/XmlResolver";
import { XmlFileCache } from "../xml/cache/XmlFileCache";

export class DefinitionResolver
{
    private readonly strategies: IDefinitionStrategy[];

    constructor(
        private readonly registry: TypeRegistry,
        private readonly diIndex: DiIndex,
        private readonly memberResolver: PhpMemberResolver,
        private readonly documents: DocumentManager,
        private readonly xmlCache: XmlFileCache
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
        document: vscode.TextDocument,
        position: vscode.Position,
        parameterName: string
    ): Promise<vscode.Location | undefined>
    {
        const xml = this.xmlCache.get(document.fileName);

        if (!xml) {
            return;
        }

        const resolver = new XmlResolver();

        const context = resolver.resolve(
            xml,
            document.offsetAt(position)
        );

        const owner =
            context.ownerVirtualType ??
            context.ownerType;

        if (!owner) {
            return;
        }

        const className =
            owner.attribute("type")?.value ??
            owner.attribute("name")?.value;

        if (!className) {
            return;
        }

        const constructor =
            this.memberResolver.resolveMethod(
                className,
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
        ownerClass: string,
        match: XmlValueMatch
    ): Promise<vscode.Location | undefined>
    {
        const type =
            this.registry.find(
                match.value
            );

        if (!type) {
            return;
        }

        return new vscode.Location(
            type.uri,
            await this.documents.position(
                type.uri,
                type.offset
            )
        );
    }
}