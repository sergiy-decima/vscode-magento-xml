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
import { PhpFileCache } from "./php/cache/PhpFileCache";
import { PhpDefinitionProvider } from "./providers/PhpDefinitionProvider";
import { DocumentManager } from "./vscode/DocumentManager";
import { DefinitionResolver } from "./resolvers/DefinitionResolver";
import { CompletionEngine } from "./completion/CompletionEngine";
import { PreferenceCompletionStrategy } from "./completion/PreferenceCompletionStrategy";

let registry = new TypeRegistry();
let cache = new PhpFileCache();
let builder = new TypeBuilder(registry, cache);
let diIndex = new DiIndex();
let documents = new DocumentManager();

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
    
    const watcher = new WorkspaceWatcher(builder, documents);
    context.subscriptions.push(watcher.start());

    await diIndex.build();
    console.log("DI index ready");

    const definitionResolver = new DefinitionResolver(registry, diIndex);
    const completionEngine = new CompletionEngine([
        new PreferenceCompletionStrategy(registry)
    ]);

    // 🔥 2. Definition provider (Ctrl+Click)
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            {scheme: "file", language: "xml"},
            new XmlDefinitionProvider(definitionResolver)
        )
    );

    // 🔥 3. Completion provider (autocomplete)
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            {scheme: "file", language: "xml"},
            new XmlCompletionProvider(completionEngine),
            "\\"
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            {scheme: "file", language: "php"},
            new PhpDefinitionProvider(registry, cache, documents)
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


// import {test} from "./test";
// test();