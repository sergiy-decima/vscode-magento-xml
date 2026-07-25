import { AbstractObjectCompletionStrategy } from "./AbstractObjectCompletionStrategy";

export class ArgumentObjectCompletionStrategy
    extends AbstractObjectCompletionStrategy
{
    public readonly key = "argument:value";
}