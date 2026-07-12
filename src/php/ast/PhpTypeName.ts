/**
 * Parsed PHP type.
 *
 * Examples:
 *
 * Foo
 * ?Foo
 * Foo|Bar
 * Foo&Bar
 */
export interface PhpTypeName {
    /**
     * Original source representation.
     *
     * Foo|Bar
     * ?Foo
     */
    text: string;

    /**
     * All referenced type names.
     *
     * Foo|Bar
     * =>
     * Foo
     * Bar
     */
    names: string[];

    /**
     * Offset in source.
     */
    offset: number;

    /**
     * Length in source.
     */
    length: number;
}