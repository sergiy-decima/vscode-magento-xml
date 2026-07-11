import * as vscode from "vscode";
import { TypeRegistry } from "./index/TypeRegistry";
import { TypeBuilder } from "./index/TypeBuilder";
import { DiIndex } from "./index/DiIndex";
import { XmlDefinitionProvider } from "./providers/XmlDefinitionProvider";
import { XmlCompletionProvider } from "./providers/XmlCompletionProvider";
import { GoToDiCommand } from "./commands/GoToDiCommand";
import { CompositeTypeSource } from "./index/CompositeTypeSource";
import { ComposerPsr4Source } from "./index/ComposerPsr4Source";
import { WorkspaceWatcher } from "./workspace/WorkspaceWatcher";
import { TypeRegistryWatcher } from "./index/TypeRegistryWatcher";
import { PhpFileCache } from "./php/cache/PhpFileCache";

let registry = new TypeRegistry();
let cache = new PhpFileCache();
let builder = new TypeBuilder(registry, cache);
let diIndex = new DiIndex();

export async function activate(
    context: vscode.ExtensionContext
) {
    console.log("Magento VSCode Tools activated");

    // 🔥 1. будуємо індекс одразу при старті
    // ComposerDiscovery → PSR-4 → ClassIndexer → ClassIndex
    const source = new CompositeTypeSource();
    source.add(new ComposerPsr4Source());
    await builder.build(source);
    console.log("Class index ready");
    
    const watcher = new WorkspaceWatcher(builder);
    context.subscriptions.push(watcher.start());

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
                await builder.build(source);
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


import {test} from "./test";
test();