import { TypeEntry } from "../index/TypeEntry";
import { TypeRegistry } from "../index/TypeRegistry";

export class ImplementationResolver
{
    constructor(
        private readonly registry: TypeRegistry
    ) {}

    public resolve(
        fqcn: string
    ): TypeEntry[]
    {
        return this.registry.findImplementations(fqcn);
    }
}