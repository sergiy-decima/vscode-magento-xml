import { PhpType } from "../ast/PhpType";

export class PhpClassContext {
    public constructor(
        public readonly type: PhpType
    ) {
    }

    public findProperty(name: string) {
        return this.type.properties.find(property => property.name === name);
    }

    public findMethod(name: string) {
        return this.type.methods.find(method => method.name === name);
    }
}