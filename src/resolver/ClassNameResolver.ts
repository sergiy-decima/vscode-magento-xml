import * as vscode from "vscode";

export class ClassNameResolver {
    public resolve(editor: vscode.TextEditor): string | undefined {
        switch (editor.document.languageId) {
            case "php":
                return this.resolvePhp(editor);
            case "xml":
                return this.resolveXml(editor);
            default:
                return undefined;
        }
    }

    private resolveXml(editor: vscode.TextEditor): string | undefined {
        const range = editor.document.getWordRangeAtPosition(
            editor.selection.active,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        return editor.document.getText(range);
    }

    private resolvePhp(editor: vscode.TextEditor): string | undefined {
        const doc = editor.document;
        const range = doc.getWordRangeAtPosition(
            editor.selection.active,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        const shortName = doc.getText(range);

        // вже FQCN
        if (shortName.includes("\\")) {
            return shortName;
        }

        const text = doc.getText();

        //
        // use Foo\Bar\RequestInterface;
        //
        const regex = /^use\s+([^;]+);$/gm;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            const fqcn = match[1].trim();
            const parts = fqcn.split("\\");
            if (parts[parts.length - 1] === shortName) {
                return fqcn;
            }
        }

        //
        // namespace Vendor\Module;
        //
        const ns = text.match(/^namespace\s+([^;]+);/m);
        if (ns) {
            return ns[1] + "\\" + shortName;
        }

        return shortName;
    }
}