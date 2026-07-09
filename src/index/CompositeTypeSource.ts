import { TypeIndexSource } from "./TypeIndexSource";
import { TypeSourceEntry } from "./TypeSourceEntry";

/**
 * Combines multiple type sources into a single source.
 */
export class CompositeTypeSource implements TypeIndexSource {
    private readonly sources: TypeIndexSource[] = [];

    public add(source: TypeIndexSource): void {
        this.sources.push(source);
    }

    public async *entries(): AsyncIterable<TypeSourceEntry> {
        for (const source of this.sources) {
            for await (const entry of source.entries()) {
                yield entry;
            }
        }
    }
}