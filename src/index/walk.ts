import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function* walk(dir: string): AsyncGenerator<string> {
    const entries = await fs.readdir(dir, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* walk(full);
            continue;
        }

        yield full;
    }
}