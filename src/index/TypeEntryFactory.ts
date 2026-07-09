import * as vscode from "vscode";
import { PhpType } from "../php/ast/PhpType";
import { TypeEntry } from "./TypeEntry";

/**
 * Конвертує PhpType у TypeEntry.
 */
export class TypeEntryFactory {
    public create(
        file: string,
        type: PhpType
    ): TypeEntry {
        return {
            fqcn: type.fqcn,
            file,
            uri: vscode.Uri.file(file),
            className: type.shortName,
            offset: type.offset,
            length: type.length,
            kind: type.kind,
            extends: type.extends,
            implements: [...type.implements],
            traits: [...type.traits]
        };
    }
}