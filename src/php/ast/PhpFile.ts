import { PhpImport } from "./PhpImport";
import { PhpType } from "./PhpType";

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
}