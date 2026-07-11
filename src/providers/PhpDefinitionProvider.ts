import * as vscode from "vscode";

import { PhpFileCache } from "../php/cache/PhpFileCache";
import { PhpTokenLocator } from "../php/parser/PhpTokenLocator";
import { PhpReferenceResolver } from "../php/resolver/PhpReferenceResolver";
import { TypeRegistry } from "../index/TypeRegistry";
import { DocumentManager } from "../vscode/DocumentManager";

/**
 * Provides Go To Definition for PHP types.
 */
export class PhpDefinitionProvider implements vscode.DefinitionProvider {
    private readonly locator = new PhpTokenLocator();
    private readonly resolver: PhpReferenceResolver;

    public constructor(
        registry: TypeRegistry,
        private readonly fileCache: PhpFileCache,
        private readonly documents: DocumentManager
    ) {
        this.resolver = new PhpReferenceResolver(registry);
    }

    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | undefined> {
        const phpFile = this.fileCache.get(document.fileName);
        if (!phpFile) {
            return;
        }

        const offset = document.offsetAt(position);
        const token = this.locator.find(document.getText(), offset);
        if (!token) {
            return;
        }

        const entry = this.resolver.resolve(phpFile, token.text);
        if (!entry) {
            return;
        }

        const targetPosition = await this.documents.position(entry.uri, entry.offset);

        return new vscode.Location(entry.uri, targetPosition);
    }
}