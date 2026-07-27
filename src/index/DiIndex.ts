import * as vscode from "vscode";
import { PreferenceEntry, PreferenceIndex } from "./di/PreferenceIndex";
import { PluginEntry, PluginIndex } from "./di/PluginIndex";
import { VirtualTypeEntry, VirtualTypeIndex } from "./di/VirtualTypeIndex";
import { TypeEntry, TypeIndex } from "./di/TypeIndex";
import { DiReference, DiReferenceIndex } from "./di/DiReferenceIndex";

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
    private readonly references = new DiReferenceIndex();

    /**
     * Нові індекси.
     */
    private readonly types = new TypeIndex();
    private readonly plugins = new PluginIndex();
    private readonly preferences = new PreferenceIndex();
    private readonly virtualTypes = new VirtualTypeIndex();

    /**
     * Старий API.
     * Поки залишаємо.
     */
    public find(className: string): DiReference[] {
        return this.references.find(className);
    }

    public findByShortName(short: string): DiReference[] {
        const result: DiReference[] = [];
        for (const [key, values] of this.references.entries()) {
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

    public findTypes(
        name: string
    ): TypeEntry[]
    {
        return this.types.find(name);
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
        this.references.add(entry);
    }

    public clear(): void {
        this.references.clear();
        this.preferences.clear();
        this.virtualTypes.clear();
        this.plugins.clear();
        this.types.clear();
    }

    public stats()
    {
        return {
            references: this.references.size(),
            preferences: this.preferences.size(),
            virtualTypes: this.virtualTypes.size(),
            plugins: this.plugins.size(),
            types: this.types.size()
        };
    }

    public addVirtualTypeReference(
        name: string,
        reference: {
            uri: vscode.Uri;
            offset: number;
            length: number;
        }
    ): void
    {
        this.virtualTypes.addReference(
            name,
            reference
        );
    }

    public findVirtualTypeReferences(
        name: string
    ): {
        uri: vscode.Uri;
        offset: number;
        length: number;
    }[]
    {
        return this.virtualTypes.find(name)?.references ?? [];
    }
}