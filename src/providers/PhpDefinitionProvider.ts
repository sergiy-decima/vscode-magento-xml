import * as vscode from "vscode";

import { PhpFileCache } from "../php/cache/PhpFileCache";
import { PhpReferenceLocator } from "../php/resolver/PhpReferenceLocator";
import { PhpReferenceResolver } from "../php/resolver/PhpReferenceResolver";
import { TypeRegistry } from "../index/TypeRegistry";
import { DocumentManager } from "../vscode/DocumentManager";

/**
 * Provides Go To Definition for PHP types.
 */
export class PhpDefinitionProvider
    implements vscode.DefinitionProvider
{
    private readonly locator =
        new PhpReferenceLocator();

    private readonly resolver:
        PhpReferenceResolver;

    public constructor(
        registry: TypeRegistry,
        private readonly fileCache: PhpFileCache,
        private readonly documents: DocumentManager
    ) {
        this.resolver =
            new PhpReferenceResolver(registry);
    }

    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | undefined>
    {
        const phpFile =
            this.fileCache.get(document.fileName);

        if (!phpFile) {
            return;
        }

        const reference =
            this.locator.find(
                phpFile,
                document.offsetAt(position)
            );

        if (!reference) {
            return;
        }

        const entry =
            this.resolver.resolve(
                phpFile,
                reference.name
            );

        if (!entry) {
            return;
        }

        return new vscode.Location(
            entry.uri,
            await this.documents.position(
                entry.uri,
                entry.offset
            )
        );
    }
}