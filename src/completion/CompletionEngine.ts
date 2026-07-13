import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class CompletionEngine
{
    private readonly strategies = new Map<string, ICompletionStrategy>();

    constructor(
        strategies: ICompletionStrategy[]
    ) {
        for (const strategy of strategies) {
            this.strategies.set(strategy.key, strategy);
        }
    }

    public complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        match: XmlAttributeMatch
    ): vscode.CompletionItem[]
    {
        const strategy = this.strategies.get(
            `${match.tag}:${match.attribute}`
        );

        if (!strategy) {
            return [];
        }

        return strategy.complete(
            document,
            position,
            match
        );
    }
}