import { TypeRegistry } from "../../index/TypeRegistry";
import { PhpFileCache } from "../cache/PhpFileCache";
import { PhpParameter } from "../ast/PhpType";

export class PhpConstructorResolver
{
    constructor(
        private readonly registry: TypeRegistry,
        private readonly cache: PhpFileCache
    ) {}

    public resolve(
        className: string,
        parameter: string
    )
    {
        return this.resolveConstructor(className)
            ?.parameters.find(
                p => p.name === parameter
            );
    }

    public resolveConstructor(
        className: string
    )
    {
        return this.resolveType(className)
            ?.methods.find(
                method => method.name === "__construct"
            );
    }

    public resolveType(
        className: string
    )
    {
        const type = this.registry.find(className);

        if (!type) {
            return;
        }

        const phpFile = this.cache.get(type.file);

        if (!phpFile) {
            return;
        }

        return phpFile.types.find(
            t => t.fqcn === className
        );
    }

    public resolveProperty(
        className: string,
        propertyName: string
    )
    {
        return this.resolveType(className)
            ?.properties.find(
                property => property.name === propertyName
            );
    }

    public resolveMethod(
        className: string,
        methodName: string
    )
    {
        return this.resolveType(className)
            ?.methods.find(
                method => method.name === methodName
            );
    }
}