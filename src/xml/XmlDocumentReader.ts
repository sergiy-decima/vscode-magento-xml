import * as fs from "fs/promises";

export class XmlDocumentReader
{
    public async read(
        file: string
    ): Promise<string>
    {
        return fs.readFile(
            file,
            "utf8"
        );
    }
}