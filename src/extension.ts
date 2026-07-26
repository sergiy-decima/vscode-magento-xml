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
import { PreferenceTypeCompletionStrategy } from "./completion/PreferenceTypeCompletionStrategy";
import { VirtualTypeTypeCompletionStrategy } from "./completion/VirtualTypeTypeCompletionStrategy";
import { PluginTypeCompletionStrategy } from "./completion/PluginTypeCompletionStrategy";
import { CompletionItemFactory } from "./completion/CompletionItemFactory";
import { TypeNameCompletionStrategy } from "./completion/TypeNameCompletionStrategy";
import { HoverResolver } from "./resolvers/HoverResolver";
import { XmlHoverProvider } from "./providers/XmlHoverProvider";
import { ReferenceResolver } from "./resolvers/ReferenceResolver";
import { XmlReferenceProvider } from "./providers/XmlReferenceProvider";
import { DiBuilder } from "./index/DiBuilder";
import { EventsIndex } from "./index/EventsIndex";
import { EventsBuilder } from "./index/EventsBuilder";
import { PhpReferenceProvider } from "./providers/PhpReferenceProvider";
import { ImplementationResolver } from "./resolvers/ImplementationResolver";
import { PhpImplementationProvider } from "./providers/PhpImplementationProvider";
import { PhpConstructorResolver } from "./php/resolver/PhpConstructorResolver";
import { PhpMethodResolver } from "./php/resolver/PhpMethodResolver";
import { XmlFileCache } from "./xml/cache/XmlFileCache";
import { ArgumentNameCompletionStrategy } from "./completion/ArgumentNameCompletionStrategy";
import { ArgumentObjectCompletionStrategy } from "./completion/ArgumentObjectCompletionStrategy";
import { ItemObjectCompletionStrategy } from "./completion/ItemObjectCompletionStrategy";
import { MemberRegistry } from "./index/MemberRegistry";

let registry = new TypeRegistry();
let members = new MemberRegistry();
let cache = new PhpFileCache();
let builder = new TypeBuilder(registry, members, cache);
// let diIndex = new DiIndex();
// let diBuilder = new DiBuilder(diIndex);
let documents = new DocumentManager();
// let eventsIndex = new EventsIndex();

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

    const xmlCache = new XmlFileCache();
    const diIndex = new DiIndex();
    const diBuilder = new DiBuilder(diIndex, xmlCache);
    await diBuilder.build();
    console.log("DI index ready");

    // const eventsBuilder = new EventsBuilder(eventsIndex);
    const eventsIndex = new EventsIndex();
    const eventsBuilder = new EventsBuilder(eventsIndex, xmlCache);
    await eventsBuilder.build();
    console.log("Events index ready");

    const constructorResolver = new PhpConstructorResolver(registry, cache);
    const methodResolver = new PhpMethodResolver(registry, cache);
    const definitionResolver = new DefinitionResolver(registry, diIndex, constructorResolver, documents);
    const hoverResolver = new HoverResolver(registry, diIndex);
    const referenceResolver = new ReferenceResolver(diIndex);
    const completionFactory = new CompletionItemFactory();
    const completionEngine = new CompletionEngine([
        new PreferenceCompletionStrategy(registry, completionFactory),
        new PreferenceTypeCompletionStrategy(registry, completionFactory),
        new VirtualTypeTypeCompletionStrategy(registry, completionFactory),
        new PluginTypeCompletionStrategy(registry, completionFactory),
        new TypeNameCompletionStrategy(registry, completionFactory),
        new ArgumentNameCompletionStrategy(methodResolver),
        new ArgumentObjectCompletionStrategy(registry, completionFactory),
        new ItemObjectCompletionStrategy(registry, completionFactory)
    ]);

    const implementationResolver = new ImplementationResolver(registry);

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
            new XmlCompletionProvider(xmlCache, completionEngine),
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

    // 🔥 6. Hover in *.xml
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            {scheme: "file", language: "xml"},
            new XmlHoverProvider(hoverResolver)
        )
    );

    // 🔥 7. XML: Якщо курсор стоїть на класі, і викликати 'Find All References' (Shift + F12), 
    // ти побачиш усі місця з di.xml, які зараз індексуються цим класом:
    // - <preference for="...">
    // - <type name="...">
    // - <plugin type="...">
    // - <virtualType name="...">
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            {scheme: "file", language: "xml"},
            new XmlReferenceProvider(referenceResolver)
        )
    );

    // 🔥 8. PHP: Якщо курсор стоїть на класі, і викликати 'Find All References' (Shift + F12), 
    // ти побачиш усі місця з di.xml, які зараз індексуються цим класом:
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            { scheme: "file", language: "php" },
            new PhpReferenceProvider(registry, cache, referenceResolver)
        )
    );

    context.subscriptions.push(
        vscode.languages.registerImplementationProvider(
            { scheme: "file", language: "php" },
            new PhpImplementationProvider(registry, cache, documents, implementationResolver)
        )
    );
}

export function deactivate() {}


// import {test} from "./test";
// test();