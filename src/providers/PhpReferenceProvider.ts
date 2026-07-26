import * as vscode from "vscode";

import { PhpFileCache } from "../php/cache/PhpFileCache";
import { PhpReferenceLocator } from "../php/resolver/PhpReferenceLocator";
import { PhpReferenceResolver } from "../php/resolver/PhpReferenceResolver";
import { TypeRegistry } from "../index/TypeRegistry";
import { ReferenceResolver } from "../resolvers/ReferenceResolver";

export class PhpReferenceProvider
    implements vscode.ReferenceProvider
{
    private readonly locator =
        new PhpReferenceLocator();

    private readonly phpResolver:
        PhpReferenceResolver;

    constructor(
        registry: TypeRegistry,
        private readonly fileCache: PhpFileCache,
        private readonly resolver: ReferenceResolver
    ) {
        this.phpResolver =
            new PhpReferenceResolver(registry);
    }

    public provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Location[]>
    {
        const phpFile =
            this.fileCache.get(document.fileName);

        if (!phpFile) {
            return [];
        }

        const reference =
            this.locator.find(
                phpFile,
                document.offsetAt(position)
            );

        if (!reference) {
            return [];
        }

        const type =
            this.phpResolver.resolve(
                phpFile,
                reference.name
            );

        if (!type) {
            return [];
        }

        return this.resolver.resolve(
            type.fqcn
        );
    }
}