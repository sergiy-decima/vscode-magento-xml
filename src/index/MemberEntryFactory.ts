import * as vscode from "vscode";

import { MemberEntry, MemberKind } from "./MemberEntry";
import { PhpType } from "../php/ast/PhpType";

export class MemberEntryFactory
{
    public create(
        file: string,
        type: PhpType
    ): MemberEntry[]
    {
        const uri = vscode.Uri.file(file);

        const result: MemberEntry[] = [];

        for (const method of type.methods) {

            result.push({
                fqcn: type.fqcn,
                kind: MemberKind.Method,
                name: method.name,
                uri,
                offset: method.offset,
                length: method.length,
                visibility: method.visibility,
                isStatic: method.isStatic,
                returnType: method.returnType,
                parameters: method.parameters
            });

        }

        for (const property of type.properties) {

            result.push({
                fqcn: type.fqcn,
                kind: MemberKind.Property,
                name: property.name,
                uri,
                offset: property.offset,
                length: property.length,
                visibility: property.visibility,
                isStatic: property.isStatic,
                isReadonly: property.isReadonly,
                type: property.type
            });

        }

        for (const constant of type.constants) {

            result.push({
                fqcn: type.fqcn,
                kind: MemberKind.Constant,
                name: constant.name,
                uri,
                offset: constant.offset,
                length: constant.length
            });

        }

        return result;
    }
}