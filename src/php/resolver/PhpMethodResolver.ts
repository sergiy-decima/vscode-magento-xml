import { PhpMethod, PhpType } from "../ast/PhpType";
import { TypeRegistry } from "../../index/TypeRegistry";
import { PhpFileCache } from "../cache/PhpFileCache";

export class PhpMethodResolver
{
    constructor(
        private readonly registry: TypeRegistry,
        private readonly cache: PhpFileCache
    ) {}

    public resolve(
        className: string,
        methodName: string
    ): PhpMethod | undefined
    {
        const type = this.resolveType(className);

        if (!type) {
            return;
        }

        return type.methods.find(
            method => method.name === methodName
        );
    }

    public resolveConstructor(
        className: string
    ): PhpMethod | undefined
    {
        return this.resolve(
            className,
            "__construct"
        );
    }

    private resolveType(
        className: string
    ): PhpType | undefined
    {
        const entry = this.registry.find(className);

        if (!entry) {
            return;
        }

        const phpFile = this.cache.get(entry.file);

        if (!phpFile) {
            return;
        }

        return phpFile.types.find(
            type => type.fqcn === className
        );
    }
}