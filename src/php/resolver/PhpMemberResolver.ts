import { MemberEntry, MemberKind } from "../../index/MemberEntry";
import { MemberRegistry } from "../../index/MemberRegistry";

export class PhpMemberResolver
{
    constructor(
        private readonly registry: MemberRegistry
    ) {}

    public resolveMethod(
        className: string,
        method: string
    ): MemberEntry | undefined
    {
        return this.registry.find(
            className,
            MemberKind.Method,
            method
        );
    }

    public resolveProperty(
        className: string,
        property: string
    ): MemberEntry | undefined
    {
        return this.registry.find(
            className,
            MemberKind.Property,
            property
        );
    }

    public resolveConstant(
        className: string,
        constant: string
    ): MemberEntry | undefined
    {
        return this.registry.find(
            className,
            MemberKind.Constant,
            constant
        );
    }
}