import { TypeRegistry } from "../../index/TypeRegistry";
import { PhpFileCache } from "../cache/PhpFileCache";
import { PhpConstant } from "../ast/PhpType";

export class PhpConstantResolver
{
    constructor(
        private readonly registry: TypeRegistry,
        private readonly cache: PhpFileCache
    ) {}

    public resolve(
        className: string,
        constantName: string
    ): PhpConstant | undefined
    {
        const type =
            this.registry.find(className);

        if (!type) {
            return;
        }

        const phpFile =
            this.cache.get(type.file);

        if (!phpFile) {
            return;
        }

        const phpType =
            phpFile.types.find(
                t => t.fqcn === className
            );

        if (!phpType) {
            return;
        }

        return phpType.constants.find(
            c => c.name === constantName
        );
    }
}