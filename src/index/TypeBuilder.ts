import * as vscode from "vscode";

import { TypeRegistry } from "./TypeRegistry";
import { TypeEntryFactory } from "./TypeEntryFactory";
import { TypeDocumentReader } from "./TypeDocumentReader";
import { TypeIndexSource } from "./TypeIndexSource";
import { PhpLexer } from "../php/lexer/PhpLexer";
import { PhpTokenStream } from "../php/parser/PhpTokenStream";
import { PhpFileParser } from "../php/parser/PhpFileParser";
import { PhpFileCache } from "../php/cache/PhpFileCache";
import { MemberRegistry } from "./MemberRegistry";
import { MemberEntryFactory } from "./MemberEntryFactory";

export class TypeBuilder {
    private readonly reader = new TypeDocumentReader();
    private readonly factory = new TypeEntryFactory();
    private readonly memberFactory = new MemberEntryFactory();

    public constructor(
        private readonly registry: TypeRegistry,
        private readonly members: MemberRegistry,
        private readonly fileCache: PhpFileCache
    ) {
    }

    public async build(
        source: TypeIndexSource
    ): Promise<void>
    {
        this.registry.clear();
        this.members.clear();
        this.fileCache.clear();

        let files = 0;

        for await (const sourceEntry of source.entries()) {
            files++;

            await this.buildFile(
                sourceEntry.file
            );
        }

        console.log(
            `[TypeBuilder] Indexed files: ${files}`
        );

        console.log(
            `[TypeBuilder] Indexed PHP types: ${this.registry.size()}`
        );

        console.log(
            `[TypeBuilder] File cache size: ${this.fileCache.size()}`
        );

        const target =
            "Zumiez\\AddressValidation\\Model\\WebapiConfigProvider";

        const targetType =
            this.registry.find(target);

        console.log(
            "[TypeBuilder] TARGET TYPE:",
            targetType
        );

        if (!targetType) {
            console.log(
                "[TypeBuilder] TARGET SHORT NAME:",
                this.registry.findByShortName(
                    "WebapiConfigProvider"
                )
            );
        }
    }

    public async buildFile(
        file: string
    ): Promise<void>
    {
        const document =
            await this.reader.read(file);

        const lexer =
            new PhpLexer(document.content);

        const stream =
            new PhpTokenStream(lexer);

        const parser =
            new PhpFileParser(stream);

        const phpFile =
            parser.parse();

        this.fileCache.set(
            document.file,
            phpFile
        );

        const targetFile =
            file.endsWith(
                "Zumiez/AddressValidation/Model/WebapiConfigProvider.php"
            );

        if (targetFile) {

            console.log(
                "========================================"
            );

            console.log(
                "[TypeBuilder] TARGET FILE:",
                file
            );

            console.log(
                "[TypeBuilder] TARGET NAMESPACE:",
                phpFile.namespace
            );

            console.log(
                "[TypeBuilder] TARGET TYPES:",
                phpFile.types.map(type => ({
                    fqcn: type.fqcn,
                    namespace: type.namespace,
                    shortName: type.shortName,
                    kind: type.kind,
                    offset: type.offset,
                    nameOffset: type.nameOffset
                }))
            );

            console.log(
                "[TypeBuilder] TARGET SOURCE:",
                document.content.substring(
                    0,
                    1000
                )
            );

            console.log(
                "========================================"
            );
        }

        for (const phpType of phpFile.types) {

            this.registry.add(
                this.factory.create(
                    document.file,
                    phpType
                )
            );

            const members =
                this.memberFactory.create(
                    document.file,
                    phpType
                );

            for (const member of members) {
                this.members.add(member);
            }
        }
    }

    public removeFile(
        file: string
    ): void
    {
        this.registry.removeByFile(file);

        this.fileCache.remove(file);

        console.log(
            `[Index] Deleted ${file}`
        );
    }
}