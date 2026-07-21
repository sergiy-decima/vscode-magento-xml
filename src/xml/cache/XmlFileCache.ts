import { XmlDocument } from "../ast/XmlDocument";

export class XmlFileCache
{
    private readonly map = new Map<string, XmlDocument>();

    public get(
        file: string
    ): XmlDocument | undefined
    {
        return this.map.get(file);
    }

    public set(
        file: string,
        document: XmlDocument
    ): void
    {
        this.map.set(file, document);
    }

    public remove(
        file: string
    ): void
    {
        this.map.delete(file);
    }

    public clear(): void
    {
        this.map.clear();
    }

    public has(
        file: string
    ): boolean
    {
        return this.map.has(file);
    }

    public size(): number
    {
        return this.map.size;
    }

    public values(): IterableIterator<XmlDocument>
    {
        return this.map.values();
    }
}