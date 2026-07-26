import * as vscode from "vscode";

import { PhpParameter } from "../php/ast/PhpType";

export enum MemberKind
{
    Method,
    Property,
    Constant
}

export interface MemberEntry
{
    fqcn: string;

    kind: MemberKind;

    name: string;

    uri: vscode.Uri;

    offset: number;

    length: number;

    visibility?: "public" | "protected" | "private";

    isStatic?: boolean;

    isReadonly?: boolean;

    type?: string;

    returnType?: string;

    parameters?: PhpParameter[];
}