import { TypeRegistry } from "../../index/TypeRegistry";
import { PhpFileCache } from "../cache/PhpFileCache";
import { PhpMethod, PhpProperty, PhpConstant } from "../ast/PhpType";

export class PhpMemberResolver
{
    constructor(
        private readonly registry: TypeRegistry,
        private readonly cache: PhpFileCache
    ) {}

    public resolveMethod(
        className: string,
        method: string
    ): PhpMethod | undefined
    {
        return this.resolveType(className)
            ?.methods.find(
                m => m.name === method
            );
    }

    public resolveProperty(
        className: string,
        property: string
    ): PhpProperty | undefined
    {
        return this.resolveType(className)
            ?.properties.find(
                p => p.name === property
            );
    }

    public resolveConstant(
        className: string,
        constant: string
    ): PhpConstant | undefined
    {
        return this.resolveType(className)
            ?.constants.find(
                c => c.name === constant
            );
    }

    private resolveType(
        className: string
    )
    {
        const entry =
            this.registry.find(className);

        if (!entry) {
            return;
        }

        const file =
            this.cache.get(entry.file);

        if (!file) {
            return;
        }

        return file.types.find(
            t => t.fqcn === className
        );
    }
}