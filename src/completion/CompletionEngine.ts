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
        if (
            !xml.node ||
            !xml.attribute
        ) {
            return [];
        }

        const strategy = this.strategies.get(
            `${xml.node.name}:${xml.attribute.name}`
        );

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