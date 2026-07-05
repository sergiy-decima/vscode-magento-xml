import { PhpType } from "../ast/PhpType";
import { PhpTypeKind } from "../ast/PhpTypeKind";

export class SimplePhpClassScanner {
    public scan(content: string): PhpType[] {
        const symbols: PhpType[] = [];
        const namespace = this.readNamespace(content);
        const classRegex = /\b(?:final\s+|abstract\s+|readonly\s+)*\b(class|interface|trait|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/g;

        let match: RegExpExecArray | null;
        while ((match = classRegex.exec(content)) !== null) {
            const shortName = match[2];
            symbols.push({
                namespace,
                shortName,
                fqcn: namespace ? `${namespace}\\${shortName}` : shortName,
                kind: PhpTypeKind.Class,
                offset: 0,
                length: 0,
                implements: [],
                traits: []
            });
        }

        return symbols;
    }

    private readNamespace(content: string): string {
        const match = content.match(/\bnamespace\s+([^;{]+)\s*[;{]/);
        if (!match) {
            return "";
        }

        return match[1].trim();
    }
}