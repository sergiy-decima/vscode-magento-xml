import * as vscode from "vscode";

import { CompletionEngine } from "../completion/CompletionEngine";
import { XmlFileCache } from "../xml/cache/XmlFileCache";
import { XmlResolver } from "../xml/XmlResolver";

export class XmlCompletionProvider
    implements vscode.CompletionItemProvider
{
    private readonly resolver = new XmlResolver();

    constructor(
        private readonly cache: XmlFileCache,
        private readonly engine: CompletionEngine
    ) {}

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[]
    {
        const offset =
            document.offsetAt(position);

        console.log(
            "=== COMPLETION PROVIDER ==="
        );

        console.log({
            file: document.fileName,
            line: position.line,
            character: position.character,
            offset,
            textBeforeCursor:
                document.getText(
                    new vscode.Range(
                        new vscode.Position(
                            Math.max(
                                0,
                                position.line
                            ),
                            0
                        ),
                        position
                    )
                )
        });

        const xml =
            this.cache.get(
                document.fileName
            );

        if (!xml) {

            console.log(
                "COMPLETION: XML CACHE NOT FOUND"
            );

            return [];
        }

        const result =
            this.resolver.resolve(
                xml,
                offset
            );

        console.log(
            "COMPLETION XML RESULT:",
            {
                node: result.node?.name,
                text: result.node?.text,
                textOffset: result.node?.textOffset,
                textLength: result.node?.textLength,
                inText: result.inText,
                inAttribute: result.inAttribute,
                argumentType: result.argumentType,
                attribute: result.attribute?.name,
                attributeValue: result.attribute?.value
            }
        );

        const completions =
            this.engine.complete(
                document,
                position,
                result
            );

        console.log(
            "COMPLETION RESULT:",
            completions.length,
            completions.map(
                item => item.label
            )
        );

        return completions;
    }
}