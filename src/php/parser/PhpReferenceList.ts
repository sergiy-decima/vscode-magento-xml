import { PhpReference, PhpReferenceKind } from "../ast/PhpReference";

/**
 * Тимчасовий збирач під час парсингу.
 * Collects all type references found during parsing.
 */
export class PhpReferenceList {
    private readonly references: PhpReference[] = [];

    public add(
        name: string,
        offset: number,
        length: number,
        kind: PhpReferenceKind
    ): void {
        this.references.push({
            name,
            offset,
            length,
            kind
        });
    }

    public values(): readonly PhpReference[] {
        return this.references;
    }

    public clear(): void {
        this.references.length = 0;
    }
}