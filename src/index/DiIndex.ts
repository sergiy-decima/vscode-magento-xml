import * as vscode from "vscode";
import { XmlNode } from "../parser/XmlScanner";
import { PreferenceEntry, PreferenceIndex } from "./di/PreferenceIndex";
import { PluginEntry, PluginIndex } from "./di/PluginIndex";
import { VirtualTypeEntry, VirtualTypeIndex } from "./di/VirtualTypeIndex";
import { TypeEntry, TypeIndex } from "./di/TypeIndex";

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

interface DiLocation
{
    uri: vscode.Uri;
    offset: number;
    length: number;
}

/**
 * Сховищем даних
 */
export class DiIndex {
    /**
     * Старий індекс.
     * Не видаляємо поки, щоб нічого не зламати.
     */
    private readonly map = new Map<string, DiReference[]>();

    /**
     * Нові індекси.
     */
    private readonly preferences = new PreferenceIndex();

    private readonly virtualTypes = new VirtualTypeIndex();

    private readonly plugins = new PluginIndex();

    private readonly types = new TypeIndex();

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
    public findPreferences(className: string): PreferenceEntry[] {
        return this.preferences.find(className);
    }

    public findVirtualType(name: string): VirtualTypeEntry | undefined {
        return this.virtualTypes.find(name);
    }

    public findPlugins(type: string): PluginEntry[] {
        return this.plugins.find(type);
    }

    public findType(name: string): TypeEntry | undefined {
        return this.types.find(name);
    }

    public consume(node: XmlNode) {

        let className: string | undefined;

        let kind: DiKind = "type";

        if (node.name === "type") {

            className = node.attributes.get("name");

            if (className) {

                this.types.add({
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

                this.preferences.add({
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

                this.virtualTypes.add({
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

                this.plugins.add({
                    name: plugin,
                    type: target,
                    plugin,
                    uri: node.uri,
                    offset: node.offset,
                    length: node.length
                });

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

    public addType(
        entry: TypeEntry
    ): void
    {
        this.types.add(entry);
    }

    public addPreference(
        entry: PreferenceEntry
    ): void
    {
        this.preferences.add(entry);
    }

    public addVirtualType(
        entry: VirtualTypeEntry
    ): void
    {
        this.virtualTypes.add(entry);
    }

    public addPlugin(
        entry: PluginEntry
    ): void
    {
        this.plugins.add(entry);
    }

    public addReference(
        entry: DiReference
    ): void
    {
        let list = this.map.get(entry.className);

        if (!list) {
            list = [];
            this.map.set(entry.className, list);
        }

        list.push(entry);
    }

    public clear(): void {
        this.map.clear();
        this.preferences.clear();
        this.virtualTypes.clear();
        this.plugins.clear();
        this.types.clear();
    }

    public logSize(): void {
        console.log(`DI entries: ${this.map.size}`);
        console.log(`Preferences: ${this.preferences.size()}`);
        console.log(`VirtualTypes: ${this.virtualTypes.size()}`);
        console.log(`Types: ${this.types.size()}`);
        console.log(`Plugin targets: ${this.plugins.size()}`);
    }
}