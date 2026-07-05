import { PhpTypeKind } from "./PhpTypeKind";

/**
 * Модель PHP-типу (class, interface, trait, enum)
 */
export interface PhpType {
    /**
     * Class / Interface / Trait / Enum
     */
    kind: PhpTypeKind;

    /**
     * Fully Qualified Class Name.
     */
    fqcn: string;

    /**
     * Namespace without trailing slash.
     */
    namespace: string;

    /**
     * Short type/class name.
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

    /**
     * Parent class.
     */
    extends?: string;

    /**
     * Implemented interfaces.
     */
    implements: readonly string[];

    /**
     * Used traits.
     */
    traits: readonly string[];
}