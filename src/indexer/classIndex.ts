import * as vscode from "vscode";

export interface PhpClass {
    fqcn: string;
    uri: vscode.Uri;
    line: number;
}

export class ClassIndex {
    private map = new Map<string, PhpClass>();

    async build() {
        const files = await vscode.workspace.findFiles("**/*.php");
        // console.log(files);
        for (const file of files) {
            // console.log("File", file.path);
            const doc = await vscode.workspace.openTextDocument(file);
            let namespace = "";
            for (let i = 0; i < doc.lineCount; i++) {
                const line = doc.lineAt(i).text.trim();
                const ns = line.match(/^namespace\s+(.+);/);
                if (ns) {
                    namespace = ns[1];
                    continue;
                }

                const cls = line.match(/^(class|interface|trait|enum)\s+([A-Za-z0-9_]+)/);
                if (cls) {
                    const name = cls[2];
                    const fqcn = namespace ? namespace + "\\" + name : name;
                    this.map.set(fqcn, {
                        fqcn,
                        uri: file,
                        line: i
                    });
                    break;
                }
            }
        }

        console.log(`Indexed classes: ${this.map.size}`);

        // console.log("=== FIRST 20 CLASSES ===");
        // let i = 0;
        // for (const cls of this.map.values()) {
        //     console.log(cls.fqcn);

        //     if (++i >= 20) {
        //         break;
        //     }
        // }
    }

    find(fqcn: string) {
        return this.map.get(fqcn);
    }

    all() {
        return [...this.map.values()];
    }
}