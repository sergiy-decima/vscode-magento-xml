/**
 * Reference to a PHP type inside a source file.
 *
 * Examples:
 *
 * extends Foo
 * implements Bar
 * new Baz()
 * function test(LoggerInterface $logger)
 */
export interface PhpReference
{
    /**
     * Referenced type name.
     *
     * Example:
     *  Foo
     *  Magento\Framework\App\State
     */
    name: string;

    /**
     * Method / property / constant.
     *
     * Example:
     * Foo::execute()
     *      ^^^^^^^
     */
    member?: string;

    /**
     * Offset inside source file.
     */
    offset: number;

    /**
     * Token length.
     */
    length: number;

    /**
     * Reference kind.
     */
    kind: PhpReferenceKind;
}

export enum PhpReferenceKind {
    Extends,
    Implements,
    Trait,
    PropertyType,
    ParameterType,
    ReturnType,
    New,
    StaticCall,
    StaticAccess,
    Instanceof,
    Catch,
    Attribute,
    StaticMethod,
    StaticProperty,
    StaticConstant,
    ClassConstant,
}