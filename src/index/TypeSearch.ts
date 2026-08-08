import { PhpTypeKind } from "../php/ast/PhpTypeKind";
import { TypeEntry } from "./TypeEntry";
import { TypeRegistry } from "./TypeRegistry";

export class TypeSearch
{
    constructor(
        private readonly registry: TypeRegistry
    ) {}

    public search(
        query: string,
        kinds?: readonly PhpTypeKind[]
    ): TypeEntry[]
    {
        const search =
            query
                .trim()
                .toLowerCase();

        const exact: TypeEntry[] = [];
        const fqcn: TypeEntry[] = [];
        const camel: TypeEntry[] = [];
        const contains: TypeEntry[] = [];

        const seen =
            new Set<string>();

        for (const entry of this.registry.values()) {

            if (
                kinds &&
                !kinds.includes(entry.kind)
            ) {
                continue;
            }

            if (search.length === 0) {

                exact.push(entry);

                continue;
            }

            const full =
                entry.fqcn.toLowerCase();

            const short =
                entry.className.toLowerCase();

            //
            // Exact class name
            //
            if (short === search) {

                this.push(
                    exact,
                    seen,
                    entry
                );

                continue;
            }

            //
            // ProductRepository
            //
            if (short.startsWith(search)) {

                this.push(
                    exact,
                    seen,
                    entry
                );

                continue;
            }

            //
            // Magento\Framework\App\State
            //
            if (full.startsWith(search)) {

                this.push(
                    fqcn,
                    seen,
                    entry
                );

                continue;
            }

            //
            // \Catalog\
            //
            if (
                full.includes(
                    "\\" + search
                )
            ) {

                this.push(
                    fqcn,
                    seen,
                    entry
                );

                continue;
            }

            //
            // MagFrAppSta
            // MagCatApiPro
            // OrdVal
            //
            if (
                this.matchesCamelCase(
                    entry,
                    query
                )
            ) {

                this.push(
                    camel,
                    seen,
                    entry
                );

                continue;
            }

            //
            // contains()
            //
            if (
                short.includes(search) ||
                full.includes(search)
            ) {

                this.push(
                    contains,
                    seen,
                    entry
                );
            }
        }

        return [
            ...exact,
            ...fqcn,
            ...camel,
            ...contains
        ];
    }

    private push(
        list: TypeEntry[],
        seen: Set<string>,
        entry: TypeEntry
    ): void
    {
        if (
            seen.has(entry.fqcn)
        ) {
            return;
        }

        seen.add(entry.fqcn);

        list.push(entry);
    }

    private matchesCamelCase(
        entry: TypeEntry,
        query: string
    ): boolean
    {
        if (!query) {
            return false;
        }

        const search =
            query.toLowerCase();

        //
        // Magento\Framework\App\State
        //
        const namespace =
            entry.fqcn
                .split("\\");

        //
        // Magento -> Mag
        // Framework -> Fr
        // ProductRepository -> ProRep
        //
        let abbreviation = "";

        for (const part of namespace) {

            abbreviation +=
                this.wordAbbreviation(part);
        }

        if (
            abbreviation
                .toLowerCase()
                .startsWith(search)
        ) {
            return true;
        }

        //
        // ProductRepositoryInterface
        // -> ProRepInt
        //
        const short =
            this.wordAbbreviation(
                entry.className
            );

        return short
            .toLowerCase()
            .startsWith(search);
    }

    private wordAbbreviation(
        word: string
    ): string
    {
        const parts =
            word.match(
                /[A-Z][a-z0-9]*/g
            );

        if (!parts) {

            return word.substring(
                0,
                Math.min(
                    3,
                    word.length
                )
            );
        }

        return parts
            .map(part =>
                part.substring(
                    0,
                    Math.min(
                        3,
                        part.length
                    )
                )
            )
            .join("");
    }
}