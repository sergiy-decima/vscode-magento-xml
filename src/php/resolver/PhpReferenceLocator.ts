import { PhpFile } from "../ast/PhpFile";
import { PhpReference } from "../ast/PhpReference";

export class PhpReferenceLocator
{
    public find(
        phpFile: PhpFile,
        offset: number
    ): PhpReference | undefined
    {
        return phpFile.references.find(
            reference =>
                offset >= reference.offset &&
                offset <= reference.offset + reference.length
        );
    }
}