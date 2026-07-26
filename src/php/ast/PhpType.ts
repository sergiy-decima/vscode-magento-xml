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
    implements: string[];

    /**
     * Used traits.
     */
    traits: string[];

    properties: PhpProperty[];
    constants: PhpConstant[];
    methods: PhpMethod[];
}

export interface PhpProperty {
    name: string;
    type?: string;
    visibility: "public" | "protected" | "private";
    isStatic: boolean;
    isReadonly: boolean;
    offset: number;
    length: number;
}

export interface PhpMethod {
    name: string;
    visibility: "public" | "protected" | "private";
    isStatic: boolean,
    returnType?: string,
    parameters: PhpParameter[] ,
    offset: number;
    length: number;
}

export interface PhpParameter {
    name: string;
    type?: string;
    offset: number;
    length: number;
}

export interface PhpConstant
{
    name: string;
    offset: number;
    length: number;
}