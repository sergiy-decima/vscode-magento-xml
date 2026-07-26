import * as vscode from 'vscode';

export enum MemberKind
{
    Method,
    Property,
    Constant
}

export interface MemberEntry
{
    fqcn: string;

    name: string;

    kind: MemberKind;

    uri: vscode.Uri;

    offset: number;

    length: number;
}