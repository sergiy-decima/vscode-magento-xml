import * as vscode from "vscode";
import { DiIndex } from "../index/DiIndex";
import { TypeRegistry } from "../index/TypeRegistry";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";

export class HoverResolver
{
    constructor(
        private readonly registry: TypeRegistry,
        private readonly diIndex: DiIndex
    ) {}

    public resolve(
        value: string
    ): vscode.Hover | undefined
    {
        const type = this.registry.find(value);

        if (!type) {
            return;
        }

        const md = new vscode.MarkdownString();

        md.appendCodeblock(type.fqcn, "php");
        md.appendMarkdown("\n\n");

        switch (type.kind) {

            case PhpTypeKind.Class:
                md.appendMarkdown("**PHP Class**");
                break;

            case PhpTypeKind.Interface:
                md.appendMarkdown("**PHP Interface**");
                break;

            case PhpTypeKind.Trait:
                md.appendMarkdown("**PHP Trait**");
                break;

            case PhpTypeKind.Enum:
                md.appendMarkdown("**PHP Enum**");
                break;

        }

        if (type.extends) {

            md.appendMarkdown("\n\n");

            md.appendMarkdown(
                `**Extends:** \`${type.extends}\``
            );

        }

        if (type.implements.length > 0) {

            md.appendMarkdown("\n\n");

            md.appendMarkdown(
                `**Implements:** ${type.implements
                    .map(i => `\`${i}\``)
                    .join(", ")}`
            );

        }

        const preferences = this.diIndex.findPreferences(type.fqcn);

        if (preferences.length > 0) {

            md.appendMarkdown("\n\n");

            md.appendMarkdown(
                `**Preferences:** ${preferences.length}`
            );

        }

        const plugins = this.diIndex.findPlugins(type.fqcn);

        if (plugins.length > 0) {

            md.appendMarkdown("\n\n");

            md.appendMarkdown(
                `**Plugins:** ${plugins.length}`
            );

        }

        return new vscode.Hover(md);
    }
}