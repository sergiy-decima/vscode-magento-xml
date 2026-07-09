/**
 * Single input item for type indexing.
 */
export interface TypeSourceEntry {
    /**
     * Absolute path to PHP file.
     */
    file: string;

    /**
     * Fully-qualified class name if it is already known.
     *
     * Example: Composer ClassMap
     */
    fqcn?: string;

    generated?: boolean;
    priority?: number;
    source?: string;
}