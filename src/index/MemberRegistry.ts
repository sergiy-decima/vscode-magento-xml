import { MemberEntry } from "./MemberEntry";
import { MemberKind } from "./MemberEntry";

export class MemberRegistry
{
    private readonly map =
        new Map<string, MemberEntry>();

    public clear(): void
    {
        this.map.clear();
    }

    public add(
        entry: MemberEntry
    ): void
    {
        this.map.set(
            this.key(
                entry.fqcn,
                entry.kind,
                entry.name
            ),
            entry
        );
    }

    public find(
        fqcn: string,
        kind: MemberKind,
        name: string
    ): MemberEntry | undefined
    {
        return this.map.get(
            this.key(
                fqcn,
                kind,
                name
            )
        );
    }

    public has(
        fqcn: string,
        kind: MemberKind,
        name: string
    ): boolean
    {
        return this.map.has(
            this.key(
                fqcn,
                kind,
                name
            )
        );
    }

    public values(): IterableIterator<MemberEntry>
    {
        return this.map.values();
    }

    public size(): number
    {
        return this.map.size;
    }

    private key(
        fqcn: string,
        kind: MemberKind,
        name: string
    ): string
    {
        return `${fqcn}|${kind}|${name}`;
    }
}