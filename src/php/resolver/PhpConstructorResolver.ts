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
    ): PhpParameter | undefined
    {
        const type = this.registry.find(className);

        if (!type) {
            return;
        }

        const phpFile = this.cache.get(type.file);

        if (!phpFile) {
            return;
        }

        const phpType = phpFile.types.find(
            t => t.fqcn === className
        );

        if (!phpType) {
            return;
        }

        const constructor = phpType.methods.find(
            m => m.name === "__construct"
        );

        if (!constructor) {
            return;
        }

        return constructor.parameters.find(
            p => p.name === parameter
        );
    }
}