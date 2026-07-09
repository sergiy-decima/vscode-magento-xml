/**
 * PHP source document.
 *
 * Immutable representation of a loaded PHP file.
 */
export interface TypeDocument {
    /**
     * Absolute file path.
     */
    file: string;

    /**
     * PHP source code.
     */
    content: string;
}