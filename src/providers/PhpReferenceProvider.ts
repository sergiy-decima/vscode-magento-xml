import * as vscode from "vscode";

import { PhpFileCache } from "../php/cache/PhpFileCache";
import { PhpTokenLocator } from "../php/parser/PhpTokenLocator";
import { PhpReferenceResolver } from "../php/resolver/PhpReferenceResolver";
import { TypeRegistry } from "../index/TypeRegistry";
import { ReferenceResolver } from "../resolvers/ReferenceResolver";

export class PhpReferenceProvider
    implements vscode.ReferenceProvider
{
    private readonly locator = new PhpTokenLocator();

    private readonly phpResolver: PhpReferenceResolver;

    constructor(
        registry: TypeRegistry,
        private readonly fileCache: PhpFileCache,
        private readonly resolver: ReferenceResolver
    ) {
        this.phpResolver = new PhpReferenceResolver(registry);
    }

    public provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Location[]>
    {
        const phpFile = this.fileCache.get(document.fileName);

        if (!phpFile) {
            return [];
        }

        const offset = document.offsetAt(position);

        const token = this.locator.find(
            document.getText(),
            offset
        );

        if (!token) {
            return [];
        }

        const type = this.phpResolver.resolve(
            phpFile,
            token.text
        );

        if (!type) {
            return [];
        }

        return this.resolver.resolve(type.fqcn);
    }
}