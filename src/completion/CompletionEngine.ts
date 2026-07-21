import * as vscode from "vscode";

import { XmlResolveResult } from "../xml/XmlResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class CompletionEngine
{
    private readonly strategies = new Map<string, ICompletionStrategy>();

    public constructor(
        strategies: ICompletionStrategy[]
    ) {
        for (const strategy of strategies) {
            this.strategies.set(
                strategy.key,
                strategy
            );
        }
    }

    public complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        xml: XmlResolveResult
    ): vscode.CompletionItem[]
    {
        if (!xml.node) {
            return [];
        }

        let key: string;

        if (xml.attribute) {
            key = `${xml.node.name}:${xml.attribute.name}`;
        } else if (xml.inText) {
            key = `${xml.node.name}:value`;
        } else {
            return [];
        }

        const strategy = this.strategies.get(key);

        if (!strategy) {
            return [];
        }

        return strategy.complete(
            document,
            position,
            xml
        );
    }
}