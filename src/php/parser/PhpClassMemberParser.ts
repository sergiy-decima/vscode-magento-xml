import { PhpProperty, PhpMethod } from "../ast/PhpType";

export class PhpClassMemberParser {
    public parseProperty(name: string, type?: string, offset = 0): PhpProperty {
        return {
            name,
            type,
            offset
        };
    }

    public parseMethod(name: string, offset = 0): PhpMethod {
        return {
            name, 
            offset
        };
    }
}