import { MemberKind } from "../../index/MemberEntry";
import { MemberRegistry } from "../../index/MemberRegistry";
import { MemberEntry } from "../../index/MemberEntry";

export class PhpMemberResolver
{
    constructor(
        private readonly members: MemberRegistry
    ) {}

    public resolveConstructor(
        className: string
    ): MemberEntry | undefined
    {
        return this.resolveMethod(
            className,
            "__construct"
        );
    }

    public resolveMethod(
        className: string,
        method: string
    ): MemberEntry | undefined
    {
        return this.members.find(
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
        return this.members.find(
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
        return this.members.find(
            className,
            MemberKind.Constant,
            constant
        );
    }
}