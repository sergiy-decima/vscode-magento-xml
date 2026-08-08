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
                const location =
                    await this.definitionResolver.resolveObjectValue(
                        owner.text.trim()
                    );

                if (!location) {
                    return;
                }

                // const targetDocument =
                //     await vscode.workspace.openTextDocument(
                //         location.uri
                //     );

                // const targetOffset =
                //     targetDocument.offsetAt(
                //         location.range.start
                //     );

                // const targetEntry =
                //     this.xmlCache;

                console.log(
                    "[XML DEFINITION] TARGET:",
                    location.uri.fsPath,
                    location.range.start.line,
                    location.range.start.character
                );

                return new vscode.Location(
                    location.uri,
                    location.range
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
        // XML attributes
        //
        switch (match.attribute) {

            case "name":

                if (match.tag === "type") {
                    return this.definitionResolver.resolveObjectValue(
                        match.value
                    );
                }

                if (match.tag === "virtualType") {
                    return this.definitionResolver.resolve(
                        match
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