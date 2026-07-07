import * as vscode from "vscode";
import { PhpType } from "../php/ast/PhpType";
import { TypeEntry } from "./TypeEntry";

export class TypeEntryFactory {
    public create(
        file: string,
        type: PhpType
    ): TypeEntry {
        return {
            fqcn: type.fqcn,
            uri: vscode.Uri.file(file),
            offset: type.offset,
            length: type.length,
            kind: type.kind,
            extends: type.extends,
            implements: [...type.implements],
            traits: [...type.traits]
        };
    }
}