import * as vscode from "vscode";
import { ClassIndex } from "./indexer/ClassIndex";
import { XmlDefinitionProvider } from "./providers/XmlDefinitionProvider";
import { XmlCompletionProvider } from "./providers/XmlCompletionProvider";

let index = new ClassIndex();

export async function activate(context: vscode.ExtensionContext) {

    console.log("Magento VSCode Tools activated");

    // 🔥 1. будуємо індекс одразу при старті
    await index.build();
    console.log("Class index ready");

    // 🔥 2. Definition provider (Ctrl+Click)
    const definition = vscode.languages.registerDefinitionProvider(
        { scheme: "file", language: "xml" },
        new XmlDefinitionProvider(index)
    );

    // 🔥 3. Completion provider (autocomplete)
    const completion = vscode.languages.registerCompletionItemProvider(
        { scheme: "file", language: "xml" },
        new XmlCompletionProvider(index),
        "\\"
    );

    // 🔥 4. команда для перебудови індексу
    const refresh = vscode.commands.registerCommand(
        "magento.refreshIndex",
        async () => {
            index = new ClassIndex();
            await index.build();
            vscode.window.showInformationMessage("Magento index rebuilt");
        }
    );

    context.subscriptions.push(definition, completion, refresh);
}

export function deactivate() {}