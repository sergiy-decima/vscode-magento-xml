import * as vscode from "vscode";

export interface EventEntry
{
    name: string;

    uri: vscode.Uri;

    offset: number;

    length: number;
}