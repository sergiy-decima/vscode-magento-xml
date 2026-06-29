import * as vscode from 'vscode';
import { ComposerPsr4Index } from './indexer/composerPsr4Index';
import { MagentoCompletionProvider } from './providers/completionProvider';
import { XmlClassResolver } from './xml/xmlClassResolver';
import { ComposerIndex } from './indexer/composerIndex';

let index: ComposerPsr4Index;
let composerIndex: ComposerIndex;

export async function activate(context: vscode.ExtensionContext) 
{
    index = new ComposerPsr4Index();
    await index.build();

    composerIndex = new ComposerIndex();
    await composerIndex.build();

    const provider = vscode.languages.registerDefinitionProvider(
        { language: 'xml' },
        {
            provideDefinition(document, position) {
                const resolver = new XmlClassResolver();
                const fqcn = resolver.getClassAtPosition(document, position);
                if (!fqcn) {
                    return;
                }
                
                const uri = index.resolve(fqcn);
                if (!uri) {
                    vscode.window.showWarningMessage(`Not found: ${fqcn}`);
                    return;
                }

                return new vscode.Location(uri, new vscode.Position(0, 0));
            }
        }
    );

    context.subscriptions.push(provider);

    const resolver = new XmlClassResolver();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider( 
            { language: "xml" },
            new MagentoCompletionProvider(composerIndex, resolver),
            "\\"
        )
    );
}

export function deactivate() {}