import * as vscode from "vscode";

import { PhpFileCache } from "../php/cache/PhpFileCache";
import { PhpTokenLocator } from "../php/parser/PhpTokenLocator";
import { PhpReferenceResolver } from "../php/resolver/PhpReferenceResolver";
import { TypeRegistry } from "../index/TypeRegistry";
import { DocumentManager } from "../vscode/DocumentManager";
import { ImplementationResolver } from "../resolvers/ImplementationResolver";

export class PhpImplementationProvider implements vscode.ImplementationProvider
{
    private readonly locator = new PhpTokenLocator();
    private readonly phpResolver: PhpReferenceResolver;

    constructor(
        registry: TypeRegistry,
        private readonly fileCache: PhpFileCache,
        private readonly documents: DocumentManager,
        private readonly resolver: ImplementationResolver
    ) {
        this.phpResolver = new PhpReferenceResolver(registry);
    }

    public async provideImplementation(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location[]>
    {
        const phpFile = this.fileCache.get(document.fileName);

        if (!phpFile) {
            return [];
        }

        const offset = document.offsetAt(position);

        const context = this.locator.find(
            document.getText(),
            offset
        );

        if (!context) {
            return [];
        }

        const type = this.phpResolver.resolve(
            phpFile,
            context.current.text
        );

        if (!type) {
            return [];
        }

        const implementations = this.resolver.resolve(
            type.fqcn
        );

        const result: vscode.Location[] = [];

        for (const implementation of implementations) {

            result.push(
                new vscode.Location(
                    implementation.uri,
                    await this.documents.position(
                        implementation.uri,
                        implementation.offset
                    )
                )
            );

        }

        return result;
    }
}