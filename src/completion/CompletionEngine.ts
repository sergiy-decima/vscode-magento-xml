import * as vscode from "vscode";

import { XmlResolveResult } from "../xml/XmlResolver";
import { ICompletionStrategy } from "./ICompletionStrategy";

export class CompletionEngine
{
    private readonly strategies =
        new Map<string, ICompletionStrategy>();

    public constructor(
        strategies: ICompletionStrategy[]
    ) {
        for (const strategy of strategies) {

            console.log(
                "REGISTER COMPLETION STRATEGY:",
                strategy.key,
                strategy.constructor.name
            );

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
            console.log(
                "COMPLETION: no XML node"
            );

            return [];
        }

        let key: string;

        if (xml.attribute) {

            key =
                `${xml.node.name}:${xml.attribute.name}`;

        } else if (xml.inText) {

            key =
                `${xml.node.name}:value`;

        } else {

            console.log(
                "COMPLETION: cursor is not in attribute/text"
            );

            return [];
        }

        console.log(
            "COMPLETION KEY:",
            key
        );

        const strategy =
            this.strategies.get(key);

        console.log(
            "COMPLETION STRATEGY:",
            strategy?.constructor.name ?? "NOT FOUND"
        );

        if (!strategy) {
            return [];
        }

        console.log(
            "BEFORE STRATEGY COMPLETE:",
            {
                node: xml.node.name,
                text: xml.node.text,
                inText: xml.inText,
                argumentType: xml.argumentType
            }
        );

        const result =
            strategy.complete(
                document,
                position,
                xml
            );

        console.log(
            "AFTER STRATEGY COMPLETE:",
            result.length
        );

        return result;
    }
}