import * as vscode from "vscode";
import { PhpTypeKind } from "../php/ast/PhpTypeKind";

/**
 * Запис "індексу". Один запис у реєстрі (FQCN → місце у файлі)
 */
export interface TypeEntry 
{
    /**
     * Fully Qualified Class Name
     *
     * Example:
     * Magento\Framework\App\State
     */
    fqcn: string;

    file: string;

    /**
     * PHP file location
     */
    uri: vscode.Uri;

    className: string;

    namespace?: string;

    /**
     * PHP type kind
     */
    kind: PhpTypeKind;

    /**
     * Position of type name in file
     * Offset всередині файлу.
     *
     * Початок declaration.
     *
     * final class Foo
     * ^^^^^
     */
    offset: number;

    /**
     * Length of type name
     * Довжина токена class/interface/trait => 21
     * Довжина declaration.
     */
    length: number;

    /**
     * Початок імені класу.
     *
     * final class Foo
     *             ^^^
     */
    nameOffset: number;

    /**
     * Довжина імені класу.
     */
    nameLength: number;

    /**
     * Parent class
     */
    extends?: string;

    /**
     * Implemented interfaces
     */
    implements: string[];

    /**
     * Used traits
     */
    traits: string[];
}