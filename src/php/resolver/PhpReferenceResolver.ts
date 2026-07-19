import { PhpFile } from "../ast/PhpFile";
import { TypeEntry } from "../../index/TypeEntry";
import { TypeRegistry } from "../../index/TypeRegistry";

/**
 * визначає, який PHP-тип під курсором.
 * Resolves PHP type references to indexed types.
 */
export class PhpReferenceResolver {
    public constructor(
        private readonly registry: TypeRegistry
    ) {
    }

    /**
     * Resolves a type name to a registered type.
     */
    public resolve(phpFile: PhpFile, typeName: string): TypeEntry | undefined {
        //
        // Fully-qualified name
        //
        if (typeName.startsWith("\\")) {
            return this.registry.find(typeName.substring(1));
        }

        //
        // Imported aliases
        //
        for (const use of phpFile.imports) {
            if (use.alias === typeName) {
                return this.registry.find(use.fqcn);
            }
        }

        //
        // Same namespace
        //
        if (phpFile.namespace) {
            const fqcn = `${phpFile.namespace}\\${typeName}`;
            const entry = this.registry.find(fqcn);
            if (entry) {
                return entry;
            }
        }

        //
        // Global namespace
        //
        return this.registry.find(typeName);
    }
}