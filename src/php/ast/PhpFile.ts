import { PhpImport } from "./PhpImport";
import { PhpReference } from "./PhpReference";
import { PhpType } from "./PhpType";

/**
 * Результат парсингу.
 */
export interface PhpFile {
    /**
     * File namespace.
     */
    namespace?: string;

    /**
     * Imported classes.
     */
    imports: PhpImport[];

    // functions: PhpFunction[];
    // constants: PhpConstant[];
    
    /**
     * Types declared in file.
     */
    types: PhpType[];

    /**
     * All type references found in file.
     */
    references: PhpReference[];
}