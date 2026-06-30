// import * as vscode from "vscode";

// export interface DiReference {
//     className: string;
//     uri: vscode.Uri;
//     line: number;
//     kind: string;
// }

// export class DiIndex {
//     private readonly map = new Map<string, DiReference[]>();

//     public async build() {
//         this.map.clear();
//         const files = await vscode.workspace.findFiles("**/etc/**/di.xml");
//         console.log(`Indexing ${files.length} di.xml files...`);

//         for (const file of files) {
//             const doc = await vscode.workspace.openTextDocument(file);
//             for (let lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
//                 const line = doc.lineAt(lineNumber).text;
//                 this.parseType(file, lineNumber, line);
//                 this.parsePreference(file, lineNumber, line);
//                 this.parsePlugin(file, lineNumber, line);
//                 this.parseVirtualType(file, lineNumber, line);
//             }
//         }

//         console.log(`Indexed ${this.map.size} DI entries`);
//     }

//     public find(className: string): DiReference[] {
//         return this.map.get(className) ?? [];
//     }

//     private parseType(uri: vscode.Uri, line: number, text: string) {
//         const match = text.match(/<type\s+name="([^"]+)"/);
//         if (!match) {
//             return;
//         }

//         this.add(match[1], {
//             className: match[1],
//             uri,
//             line,
//             kind: "type"
//         });
//     }

//     private parsePreference(uri: vscode.Uri, line: number, text: string) {
//         const match = text.match(/<preference\s+for="([^"]+)"/);
//         if (!match) {
//             return;
//         }

//         this.add(match[1], {
//             className: match[1],
//             uri,
//             line,
//             kind: "preference"
//         });
//     }

//     private parsePlugin(uri: vscode.Uri, line: number, text: string) {
//         const match = text.match(/<type\s+name="([^"]+)"/);
//         if (!match) {
//             return;
//         }

//         if (!text.includes("<plugin")) {
//             return;
//         }

//         this.add(match[1], {
//             className: match[1],
//             uri,
//             line,
//             kind: "plugin"
//         });
//     }

//     private parseVirtualType(uri: vscode.Uri, line: number, text: string) {
//         const match = text.match(/<virtualType\s+name="([^"]+)"/);
//         if (!match) {
//             return;
//         }

//         this.add(match[1], {
//             className: match[1],
//             uri,
//             line,
//             kind: "virtualType"
//         });
//     }

//     private add(className: string, reference: DiReference) {
//         const list = this.map.get(className) ?? [];
//         list.push(reference);
//         this.map.set(className, list);
//     }
// }


import * as vscode from "vscode";

export type DiKind =
    | "type"
    | "preference"
    | "virtualType"
    | "plugin";

export interface DiReference {
    className: string;
    kind: DiKind;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class DiIndex 
{
    private readonly map = new Map<string, DiReference[]>();

    public async build(): Promise<void> {
        this.map.clear();
        const files = await vscode.workspace.findFiles("**/etc/**/di.xml");
        console.log(`Scanning ${files.length} di.xml files`);

        for (const file of files) {
            const doc = await vscode.workspace.openTextDocument(file);
            this.indexDocument(
                file,
                doc.getText()
            );
        }

        console.log(`DI symbols: ${this.map.size}`);
    }

    public find(className: string): DiReference[] {
        return this.map.get(className) ?? [];
    }

    private indexDocument(uri: vscode.Uri, xml: string): void {
        this.collect(
            uri,
            xml,
            /<type\b[^>]*name="([^"]+)"/g,
            "type"
        );

        this.collect(
            uri,
            xml,
            /<preference\b[^>]*for="([^"]+)"/g,
            "preference"
        );

        this.collect(
            uri,
            xml,
            /<virtualType\b[^>]*type="([^"]+)"/g,
            "virtualType"
        );
    }

    private collect(
        uri: vscode.Uri,
        xml: string,
        regex: RegExp,
        kind: DiKind
    ): void {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(xml)) !== null) {
            const className = match[1];
            const offset = match.index + match[0].indexOf(className);
            const list = this.map.get(className) ?? [];

            list.push({
                className,
                kind,
                uri,
                offset,
                length: className.length
            });

            this.map.set(
                className,
                list
            );
        }
    }
}