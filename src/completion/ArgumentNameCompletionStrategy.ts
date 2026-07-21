import * as vscode from "vscode";

import { ICompletionStrategy } from "./ICompletionStrategy";
import { XmlResolveResult } from "../xml/XmlResolver";

import { PhpConstructorResolver } from "../php/resolver/PhpConstructorResolver";

export class ArgumentNameCompletionStrategy
    implements ICompletionStrategy
{
    public readonly key = "argument:name";

    constructor(
        private readonly resolver: PhpConstructorResolver
    ) {}

    public complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        xml: XmlResolveResult
    ): vscode.CompletionItem[]
    {
        const owner =
            xml.ownerVirtualType ??
            xml.ownerType;

        if (!owner) {
            return [];
        }

        const className =
            owner.attribute("type")?.value ??
            owner.attribute("name")?.value;

        if (!className) {
            return [];
        }

        const constructor =
            this.resolver.resolveConstructor(
                className
            );

        if (!constructor) {
            return [];
        }

        return constructor.parameters.map(
            parameter => {

                const item =
                    new vscode.CompletionItem(
                        parameter.name,
                        vscode.CompletionItemKind.Field
                    );

                item.insertText =
                    parameter.name;

                item.detail =
                    parameter.type;

                return item;
            }
        );
    }
}