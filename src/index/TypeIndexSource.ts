import { TypeSourceEntry } from "./TypeSourceEntry";

/**
 * Source of PHP types for indexing.
 */
export interface TypeIndexSource {
    /**
     * Returns PHP files available for indexing.
     */
    entries(): AsyncIterable<TypeSourceEntry>;
}