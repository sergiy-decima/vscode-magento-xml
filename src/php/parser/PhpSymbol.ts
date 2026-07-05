export interface PhpSymbol {
    /**
     * Class / Interface / Trait / Enum.
     */
    kind: PhpSymbolKind;

    /**
     * Fully Qualified Class Name.
     */
    fqcn: string;

    /**
     * Namespace without trailing slash.
     */
    namespace: string;

    /**
     * Short class name.
     */
    shortName: string;

    /**
     * Offset of the declaration keyword.
     *
     * Example: final class Foo^^
     */
    offset: number;

    /**
     * Length of declaration keyword + identifier.
     *
     * Example: class Foo
     */
    length: number;
}

export const enum PhpSymbolKind {
    Class,
    Interface,
    Trait,
    Enum
}