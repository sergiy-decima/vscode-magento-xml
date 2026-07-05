import * as vscode from "vscode";
import { TypeRegistry } from "./index/TypeRegistry";
import { TypeBuilder } from "./index/TypeBuilder";
import { ComposerDiscovery } from "./index/ComposerDiscovery";
import { DiIndex } from "./index/DiIndex";
import { XmlDefinitionProvider } from "./providers/XmlDefinitionProvider";
import { XmlCompletionProvider } from "./providers/XmlCompletionProvider";
import { GoToDiCommand } from "./commands/GoToDiCommand";

let registry = new TypeRegistry();
let builder = new TypeBuilder();
let diIndex = new DiIndex();
let discovery = new ComposerDiscovery();

export async function activate(
    context: vscode.ExtensionContext
) {
    console.log("Magento VSCode Tools activated");

    // 🔥 1. будуємо індекс одразу при старті
    // ComposerDiscovery → PSR-4 → ClassIndexer → ClassIndex
    const roots = await discovery.discover();
    await builder.build(roots, registry);
    console.log("Class index ready");

    await diIndex.build();
    console.log("DI index ready");

    // 🔥 2. Definition provider (Ctrl+Click)
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            {scheme: "file", language: "xml"},
            new XmlDefinitionProvider(registry)
        )
    );

    // 🔥 3. Completion provider (autocomplete)
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            {scheme: "file", language: "xml"},
            new XmlCompletionProvider(registry),
            "\\"
        )
    );

    // 🔥 4. команда для перебудови індексу
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "magento.refreshIndex",
            async () => {
                await builder.build(roots, registry);
                vscode.window.showInformationMessage("Magento index rebuilt");
            }
        )
    );

    // 🔥 5. cmd + shift + P on class name and Go To DI.xml
    const goToDi = new GoToDiCommand(diIndex);
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "magento.goToDi",
            () => goToDi.execute()
        )
    );
}

export function deactivate() {}


// import {test} from "./test";
// test();