import * as vscode from "vscode";

export interface PhpClass {
    fqcn: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class ClassIndex 
{
    private readonly map = new Map<string, PhpClass>();

    public async build(): Promise<void> {
        this.map.clear();
        const files = await vscode.workspace.findFiles("**/*.php");
        for (const file of files) {
            const doc = await vscode.workspace.openTextDocument(file);
            const text = doc.getText();
            const namespaceMatch = text.match(/namespace\s+([^;]+);/);
            const namespace = namespaceMatch ? namespaceMatch[1].trim() : "";
            const regex = /(class|interface|trait|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/g;

            let match: RegExpExecArray | null;
            while ((match = regex.exec(text)) !== null) {
                const name = match[2];
                const fqcn = namespace ? `${namespace}\\${name}` : name;
                this.map.set(fqcn, {
                    fqcn,
                    uri: file,
                    offset: match.index,
                    length: match[0].length
                });
                break;
            }
        }

        console.log(`Indexed classes: ${this.map.size}`);
    }

    public find(fqcn: string): PhpClass | undefined {
        return this.map.get(fqcn);
    }

    public all(): PhpClass[] {
        return [...this.map.values()];
    }
}