import * as vscode from "vscode";
import { XmlScanner, XmlNode } from "../parser/XmlScanner";

export type DiKind =
    | "type"
    | "preference"
    | "virtualType"
    | "plugin";

export interface DiReference {
    className: string;
    kind: DiKind;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export interface PreferenceEntry {
    for: string;
    type: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export interface VirtualTypeEntry {
    name: string;
    type: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export interface PluginEntry {
    name: string;
    type: string;
    plugin: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export interface TypeEntry {
    name: string;
    uri: vscode.Uri;
    offset: number;
    length: number;
}

export class DiIndex {

    /**
     * Старий індекс.
     * Не видаляємо поки, щоб нічого не зламати.
     */
    private readonly map = new Map<string, DiReference[]>();

    /**
     * Нові індекси.
     */
    private readonly preferences = new Map<string, PreferenceEntry>();

    private readonly virtualTypes = new Map<string, VirtualTypeEntry>();

    private readonly plugins = new Map<string, PluginEntry[]>();

    private readonly types = new Map<string, TypeEntry>();

    private readonly scanner = new XmlScanner();

    public async build(): Promise<void> {

        this.map.clear();

        this.preferences.clear();

        this.virtualTypes.clear();

        this.plugins.clear();

        this.types.clear();

        const files = await vscode.workspace.findFiles("**/etc/**/di.xml");

        console.log(`Scanning ${files.length} di.xml files`);

        for (const file of files) {

            const doc = await vscode.workspace.openTextDocument(file);

            const nodes = this.scanner.scanDi(doc.getText(), file);

            for (const node of nodes) {
                this.consume(node);
            }
        }

        console.log(`DI entries: ${this.map.size}`);
        console.log(`Preferences: ${this.preferences.size}`);
        console.log(`VirtualTypes: ${this.virtualTypes.size}`);
        console.log(`Types: ${this.types.size}`);
        console.log(`Plugin targets: ${this.plugins.size}`);
    }

    /**
     * Старий API.
     * Поки залишаємо.
     */
    public find(className: string): DiReference[] {
        return this.map.get(className) ?? [];
    }

    public findByShortName(short: string): DiReference[] {

        const result: DiReference[] = [];

        for (const [key, values] of this.map) {

            if (key.endsWith("\\" + short)) {
                result.push(...values);
            }

        }

        return result;
    }

    /**
     * Новий API.
     */

    public findPreference(className: string): PreferenceEntry | undefined {
        return this.preferences.get(className);
    }

    public findVirtualType(name: string): VirtualTypeEntry | undefined {
        return this.virtualTypes.get(name);
    }

    public findPlugins(type: string): PluginEntry[] {
        return this.plugins.get(type) ?? [];
    }

    public findType(name: string): TypeEntry | undefined {
        return this.types.get(name);
    }

    private consume(node: XmlNode) {

        let className: string | undefined;

        let kind: DiKind = "type";

        if (node.name === "type") {

            className = node.attributes.get("name");

            if (className) {

                this.types.set(className, {
                    name: className,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

            }

            kind = "type";
        }

        if (node.name === "preference") {

            const forClass = node.attributes.get("for");

            const typeClass = node.attributes.get("type");

            if (forClass && typeClass) {

                this.preferences.set(forClass, {
                    for: forClass,
                    type: typeClass,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = forClass;

            }

            kind = "preference";
        }

        if (node.name === "virtualType") {

            const name = node.attributes.get("name");

            const type = node.attributes.get("type");

            if (name && type) {

                this.virtualTypes.set(name, {
                    name,
                    type,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                className = name;

            }

            kind = "virtualType";
        }

        if (node.name === "plugin") {

            const target = node.attributes.get("type");

            const plugin = node.attributes.get("name");

            if (target && plugin) {

                const list = this.plugins.get(target) ?? [];

                list.push({
                    name: plugin,
                    type: target,
                    plugin,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

                this.plugins.set(target, list);

                className = target;

            }

            kind = "plugin";
        }

        if (!className) {
            return;
        }

        const list = this.map.get(className) ?? [];
        list.push({
            className,
            kind,
            uri: node.uri,
            offset: node.offset,
            length: node.length
        });

        this.map.set(className, list);
    }
}