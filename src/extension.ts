// import * as vscode from "vscode";
// import { ClassIndex } from "./index/ClassIndex";
// import { XmlDefinitionProvider } from "./providers/XmlDefinitionProvider";
// import { XmlCompletionProvider } from "./providers/XmlCompletionProvider";

// let index = new ClassIndex();

// export async function activate(context: vscode.ExtensionContext) {

//     console.log("Magento VSCode Tools activated");

//     // 🔥 1. будуємо індекс одразу при старті
//     await index.build();
//     console.log("Class index ready");

//     // 🔥 2. Definition provider (Ctrl+Click)
//     const definition = vscode.languages.registerDefinitionProvider(
//         { scheme: "file", language: "xml" },
//         new XmlDefinitionProvider(index)
//     );

//     // 🔥 3. Completion provider (autocomplete)
//     const completion = vscode.languages.registerCompletionItemProvider(
//         { scheme: "file", language: "xml" },
//         new XmlCompletionProvider(index),
//         "\\"
//     );

//     // 🔥 4. команда для перебудови індексу
//     const refresh = vscode.commands.registerCommand(
//         "magento.refreshIndex",
//         async () => {
//             index = new ClassIndex();
//             await index.build();
//             vscode.window.showInformationMessage("Magento index rebuilt");
//         }
//     );

//     context.subscriptions.push(definition, completion, refresh);
// }

// export function deactivate() {}


import * as vscode from "vscode";
import { ClassIndex } from "./index/ClassIndex";
import { DiIndex } from "./index/DiIndex";
import { XmlDefinitionProvider } from "./providers/XmlDefinitionProvider";
import { XmlCompletionProvider } from "./providers/XmlCompletionProvider";
import { GoToDiCommand } from "./commands/GoToDiCommand";

let index = new ClassIndex();
let diIndex = new DiIndex();

export async function activate(
    context: vscode.ExtensionContext
) {
    console.log("Magento VSCode Tools activated");

    // 🔥 1. будуємо індекс одразу при старті
    await index.build();
    console.log("Class index ready");


    // console.log("Total classes:", index.size());
    // console.log(index.find("AESKW\\A256KW"));
    // console.log(index.find("phpseclib3\\File\\ANSI"));
    // console.log(index.find("tubalmartin\\CssMin\\Utils"));
    // console.log(index.find("Magento\\Framework\\App\\State"));


    await diIndex.build();
    console.log("DI index ready");

    // 🔥 2. Definition provider (Ctrl+Click)
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            {scheme: "file", language: "xml"},
            new XmlDefinitionProvider(index)
        )
    );

    // 🔥 3. Completion provider (autocomplete)
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            {scheme: "file", language: "xml"},
            new XmlCompletionProvider(index),
            "\\"
        )
    );

    // 🔥 4. команда для перебудови індексу
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "magento.refreshIndex",
            async () => {
                index = new ClassIndex();
                await index.build();
                vscode.window.showInformationMessage("Magento index rebuilt");
            }
        )
    );

    // 🔥 5. cmd + shift + P on class name and Go To DI.xml
    const goToDi = new GoToDiCommand(index, diIndex);
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "magento.goToDi",
            () => goToDi.execute()
        )
    );
}

export function deactivate() {}


// import { PhpLexer } from "./php/lexer/PhpLexer";
// import { TokenType } from "./php/lexer/TokenType";

// const lexer = new PhpLexer(`
// <?php

// namespace Magento\Framework\App;

// final readonly class State {}
// `);

// while (lexer.scan() !== TokenType.EOF) {
//     console.log(
//         TokenType[lexer.tokenType()],
//         lexer.tokenText()
//     );
// }
/////////////////
// import { PhpClassScanner } from "./php/parser/PhpClassScanner";

// const scanner = new PhpClassScanner();
// const symbols = scanner.scan(`
// <?php

// namespace Magento\\Framework\\App;

// final readonly class State 
// {
// }
// `);

// console.log("Symbols: ", symbols);


// const index = new ClassIndex();
    // index.add({
    //     fqcn: "Magento\\Framework\\App\\State",
    //     uri: vscode.Uri.file("/tmp/State.php"),
    //     offset: 123,
    //     length: 10
    // });

    // console.log(index.size()); // 1
    // console.log(index.has("Magento\\Framework\\App\\State")); // true
    // console.log(index.find("Magento\\Framework\\App\\State"));
    // console.log(index.all().length); // 1
    

    // console.log("Start ComposerDiscovery test");
    // const discovery = new ComposerDiscovery();
    // const roots = await discovery.discover();
    // console.log("ComposerDiscovery is loading...");
    // console.log(roots);
    // console.log("ComposerDiscovery is ready");

    // const index = new ClassIndex();
    // const indexer = new ClassIndexer();
    // await indexer.build(roots, index);
    // console.log("Index size:", index.size());
    // console.log("Found:", index.find("Zumiez\\AurusPayPal\\Model\\Logging\\UpdateLogs"));
    
// import {test} from "./test";
// test();