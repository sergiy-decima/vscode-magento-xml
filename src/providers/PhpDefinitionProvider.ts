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
        console.log("########################");
        console.log("PHP PROVIDER VERSION 777");
        console.log("########################");

        const phpFile =
            this.fileCache.get(document.fileName);

        if (!phpFile) {
            console.log("NO PHP FILE");
            return;
        }

        console.log("REFERENCES:", phpFile.references.length);
        for (const reference of phpFile.references) {
            console.log(reference);
        }

        const reference =
            this.locator.find(
                phpFile,
                document.offsetAt(position)
            );

        console.log(
            "OFFSET:",
            document.offsetAt(position)
        );

        console.log(
            "REFERENCE:",
            reference
        );

        if (!reference) {
            console.log("NO REFERENCE");
            return;
        }

        const entry =
            this.resolver.resolve(
                phpFile,
                reference.name
            );

        if (!entry) {
            console.log("NO ENTRY");
            return;
        }

        throw new Error("OUR PROVIDER");
        return;

        // const phpFile =
        //     this.fileCache.get(document.fileName);

        // if (!phpFile) {
        //     return;
        // }

        // const reference =
        //     this.locator.find(
        //         phpFile,
        //         document.offsetAt(position)
        //     );

        // if (!reference) {
        //     return;
        // }

        // const entry =
        //     this.resolver.resolve(
        //         phpFile,
        //         reference.name
        //     );

        // if (!entry) {
        //     return;
        // }

        // const start =
        //     await this.documents.position(
        //         entry.uri,
        //         entry.nameOffset
        //     );

        // const end =
        //     await this.documents.position(
        //         entry.uri,
        //         entry.nameOffset + entry.nameLength
        //     );

        // // return new vscode.Location(
        // //     entry.uri,
        // //     new vscode.Range(start, end)
        // // );

        // // return new vscode.Location(
        // //     entry.uri,
        // //     await this.documents.position(
        // //         entry.uri,
        // //         entry.nameOffset
        // //     )
        // // );

        // const position2 =
        //     await this.documents.position(
        //         entry.uri,
        //         entry.nameOffset
        //     );

        // console.log("ENTRY:", entry);
        // console.log("POSITION:", position2);
        // console.log(
        //     "OPEN",
        //     entry.uri.fsPath,
        //     entry.nameOffset,
        //     position2.line,
        //     position2.character
        // );

        // throw new Error("OUR PROVIDER");
        // // return new vscode.Location(
        // //     entry.uri,
        // //     position2
        // // );
    }
}