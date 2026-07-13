import * as vscode from "vscode";
import { XmlAttributeMatch } from "../xml/XmlAttributeResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class CompletionEngine
{
    constructor(
        private strategies: ICompletionStrategy[]
    ) {}

    public complete(
        match: XmlAttributeMatch
    ): vscode.CompletionItem[]
    {
        for (const strategy of this.strategies) {

            if (strategy.supports(match)) {
                return strategy.complete(
                    match,
                    match.value
                );
            }

        }

        return [];
    }
}