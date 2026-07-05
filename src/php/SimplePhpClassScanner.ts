import { PhpSymbol, PhpSymbolKind } from "./parser/PhpSymbol";

export class SimplePhpClassScanner {
    public scan(content: string): PhpSymbol[] {
        const symbols: PhpSymbol[] = [];
        const namespace = this.readNamespace(content);
        const classRegex = /\b(?:final\s+|abstract\s+|readonly\s+)*\b(class|interface|trait|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/g;

        let match: RegExpExecArray | null;
        while ((match = classRegex.exec(content)) !== null) {
            const shortName = match[2];
            symbols.push({
                namespace,
                shortName,
                fqcn: namespace ? `${namespace}\\${shortName}` : shortName,
                kind: PhpSymbolKind.Class,
                offset: 0,
                length: 0
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