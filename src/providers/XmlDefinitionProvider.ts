import * as vscode from "vscode";

import { XmlAttributeResolver } from "../xml/XmlAttributeResolver";
import { DefinitionResolver } from "../resolvers/DefinitionResolver";
import { XmlFileCache } from "../xml/cache/XmlFileCache";
import { XmlResolver } from "../xml/XmlResolver";

export class XmlDefinitionProvider implements vscode.DefinitionProvider
{
    private readonly xmlResolver = new XmlResolver();

    constructor(
        private readonly xmlCache: XmlFileCache,
        private readonly definitionResolver: DefinitionResolver
    ) {}

    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined>
    {
        const xml = this.xmlCache.get(document.fileName);

        if (!xml) {
            return;
        }

        const context = this.xmlResolver.resolve(
            xml,
            document.offsetAt(position)
        );

        //
        // <argument xsi:type="object">Class</argument>
        // <item xsi:type="object">Class</item>
        //
        if (
            context.inText &&
            context.argumentType === "object"
        ) {
            const owner =
                context.ownerItem ??
                context.ownerArgument;

            if (
                owner &&
                owner.text.trim().length > 0
            ) {
                return this.definitionResolver.resolveObjectValue(
                    owner.text.trim()
                );
            }
        }

        const match =
            XmlAttributeResolver.resolve(
                document,
                position
            );

        if (!match) {
            return;
        }

        //
        // <argument name="foo">
        //
        if (
            match.tag === "argument" &&
            match.attribute === "name"
        ) {
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

            return this.definitionResolver.resolveArgument(
                className,
                match.value
            );
        }

        //
        // Будь-який XML-атрибут
        //
        switch (match.attribute) {

            case "name":

                if (
                    match.tag === "type" ||
                    match.tag === "virtualType"
                ) {
                    return this.definitionResolver.resolveObjectValue(
                        match.value
                    );
                }

                break;

            case "type":
            case "class":
            case "instance":
            case "for":
            case "parent":
            case "extends":

                return this.definitionResolver.resolve(match);
        }

        return;
    }
}