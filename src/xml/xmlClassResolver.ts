import * as vscode from "vscode";

export class XmlClassResolver {
    public getClassAtPosition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined {

        const range = document.getWordRangeAtPosition(
            position,
            /[A-Za-z0-9_\\]+/
        );

        if (!range) {
            return;
        }

        const value = document.getText(range);
        if (!value.includes("\\")) {
            return;
        }

        return value;
    }

    /**
     * Повертає FQCN або його префікс, якщо курсор знаходиться
     * всередині XML-атрибута.
     *
     * Наприклад:
     * <type name="Magento\Cat|">
     * поверне
     * Magento\Cat
     */
    public getClassPrefix(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined {
        const line = document.lineAt(position.line).text;
        const cursor = position.character;
        const beforeCursor = line.substring(0, cursor);
        const quote = beforeCursor.lastIndexOf('"');
        if (quote === -1) {
            return;
        }

        const value = beforeCursor.substring(quote + 1);
        if (!value.includes("\\")) {
            return;
        }

        return value;
    }
}