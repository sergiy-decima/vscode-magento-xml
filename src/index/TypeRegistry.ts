import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { TypeEntry } from "./TypeEntry";

/**
 * Зберігає індекс
 * Зберігає знайдені типи - сховище
 */
export class TypeRegistry 
{
    private readonly map = new Map<string, TypeEntry>();
    private readonly fileMap = new Map<string, Set<string>>();
    private readonly shortNameMap = new Map<string, Set<string>>();

    /**
     * Remove all indexed data.
     */
    public clear(): void {
        this.map.clear();
        this.fileMap.clear();
        this.shortNameMap.clear();
    }

    /**
     * Add type entry.
     */
    public add(entry: TypeEntry): void {
        this.map.set(entry.fqcn, entry);
        let types = this.fileMap.get(entry.file); // file -> fqcn
        if (!types) {
            types = new Set<string>();
            this.fileMap.set(entry.file, types);
        }
        types.add(entry.fqcn);

        // shortName -> fqcn
        let shortTypes = this.shortNameMap.get(entry.className);
        if (!shortTypes) {
            shortTypes = new Set<string>();
            this.shortNameMap.set(entry.className, shortTypes);
        }
        shortTypes.add(entry.fqcn);
    }

    /**
     * Check type existence.
     */
    public has(fqcn: string): boolean {
        return this.map.has(fqcn);
    }

    public hasFile(file: string): boolean {
        return this.fileMap.has(file);
    }

    /**
     * Find by FQCN.
     */
    public find(fqcn: string): TypeEntry | undefined {
        return this.map.get(fqcn);
    }

    /**
     * Find all types from file.
     */
    public findByFile(file: string): TypeEntry[] {
        const types = this.fileMap.get(file);
        if (!types) {
            return [];
        }

        return [...types]
            .map( fqcn => this.map.get(fqcn) )
            .filter( (entry): entry is TypeEntry => entry !== undefined );
    }

    /**
     * Find by short class name.
     *
     * Example: State
     * returns: Magento\Framework\App\State
     */
    public findByShortName(name: string): TypeEntry[] {
        const types = this.shortNameMap.get(name);
        if (!types) {
            return [];
        }

        return [...types]
            .map(fqcn => this.map.get(fqcn))
            .filter(
                (entry): entry is TypeEntry => entry !== undefined
            );
    }

    /**
     * Remove type by FQCN.
     */
    public remove(fqcn: string): boolean {
        const entry = this.map.get(fqcn);
        if (!entry) {
            return false;
        }
        
        this.map.delete(fqcn);

        const types = this.fileMap.get(entry.file);
        types?.delete(fqcn);
        if (types?.size === 0) {
            this.fileMap.delete(entry.file);
        }

        // remove from short name index
        const shortTypes = this.shortNameMap.get(entry.className);
        if (shortTypes) {
            shortTypes.delete(fqcn);
            if (shortTypes.size === 0) {
                this.shortNameMap.delete(entry.className);
            }
        }

        return true;
    }

    /**
     * Remove all types belonging to file.
     */
    public removeByFile(file: string): void {
        const types = this.fileMap.get(file);
        if (!types) {
            return;
        }

        for (const fqcn of types) {
            this.map.delete(fqcn);
        }
        this.fileMap.delete(file);
    }

    /**
     * All indexed entries.
     */
    public all(): readonly TypeEntry[] {
        return [...this.map.values()];
    }

    /**
     * Map iterator.
     */
    public entries(): IterableIterator<[string, TypeEntry]> {
        return this.map.entries();
    }

    /**
     * Value iterator.
     */
    public values(): IterableIterator<TypeEntry> {
        return this.map.values();
    }

    /**
     * Total number of indexed types - entities
     *
     * @returns {number}
     */
    public size(): number {
        return this.map.size;
    }

    /**
     * @returns 
     */
    public files(): IterableIterator<string> {
        return this.fileMap.keys();
    }

    public findByKind(kind: PhpTypeKind): TypeEntry[]
    {
        return [...this.map.values()].filter(
            entry => entry.kind === kind
        );
    }

    public search(
        prefix: string,
        kinds?: readonly PhpTypeKind[]
    ): TypeEntry[]
    {
        const search = prefix.toLowerCase();
        const result: TypeEntry[] = [];
        for (const entry of this.map.values()) {
            if (
                kinds &&
                !kinds.includes(entry.kind)
            ) {
                continue;
            }

            const fqcn = entry.fqcn.toLowerCase();
            if (
                fqcn.startsWith(search) ||
                fqcn.includes("\\" + search)
            ) {
                result.push(entry);
            }
        }

        return result;
    }

    public findImplementations(
        fqcn: string
    ): TypeEntry[]
    {
        const result: TypeEntry[] = [];
        const visited = new Set<string>();

        this.collectImplementations(
            fqcn,
            result,
            visited
        );

        return result;
    }

    private collectImplementations(
        fqcn: string,
        result: TypeEntry[],
        visited: Set<string>
    ): void
    {
        if (visited.has(fqcn)) {
            return;
        }

        visited.add(fqcn);

        for (const entry of this.map.values()) {

            if (
                entry.extends !== fqcn &&
                !entry.implements.includes(fqcn)
            ) {
                continue;
            }

            result.push(entry);

            //
            // Find subclasses / derived implementations
            //
            this.collectImplementations(
                entry.fqcn,
                result,
                visited
            );
        }
    }
}