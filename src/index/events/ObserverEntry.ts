import * as vscode from "vscode";

export interface ObserverEntry
{
    event: string;

    name: string;

    instance: string;

    uri: vscode.Uri;

    offset: number;

    length: number;
}