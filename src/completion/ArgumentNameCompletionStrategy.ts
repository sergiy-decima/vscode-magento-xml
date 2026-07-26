import * as vscode from "vscode";

import { ICompletionStrategy } from "./ICompletionStrategy";
import { XmlResolveResult } from "../xml/XmlResolver";
import { PhpMemberResolver } from "../php/resolver/PhpMemberResolver";
import { PhpParameter } from "../php/ast/PhpType";

export class ArgumentNameCompletionStrategy
    implements ICompletionStrategy
{
    public readonly key = "argument:name";

    constructor(
        private readonly memberResolver: PhpMemberResolver
    ) {}

    public complete(
        document: vscode.TextDocument,
        position: vscode.Position,
        xml: XmlResolveResult
    ): vscode.CompletionItem[]
    {
        // console.log("ArgumentNameCompletionStrategy");
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

        const constructor = this.memberResolver.resolveMethod(
            className,
            "__construct"
        );

        if (!constructor || !constructor.parameters) {
            return [];
        }

        // console.log(constructor);
        // console.log("OLOLO");
        // console.log(
        //     constructor.parameters.map(p => p.name)
        // );

        return constructor.parameters.map(
            (parameter: PhpParameter)  => {
                const item = new vscode.CompletionItem(
                    parameter.name,
                    vscode.CompletionItemKind.Field
                );

                item.label = parameter.name;
                item.insertText = parameter.name;
                item.filterText = parameter.name;
                item.sortText = parameter.name;
                item.detail = parameter.type;

                // const attribute = xml.attribute!;
                // item.textEdit = new vscode.TextEdit(
                //     new vscode.Range(
                //         document.positionAt(attribute.offset),
                //         document.positionAt(attribute.offset + attribute.length)
                //     ),
                //     parameter.name
                // );
                // item.filterText = parameter.name;
                // item.sortText = parameter.name;

                return item;
            }
        );
    }
}