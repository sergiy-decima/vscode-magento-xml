import * as path from "node:path";
import { Psr4Root } from "./Psr4Root";

export function resolvePsr4(
    file: string,
    root: Psr4Root
): string {
    const relative = path.relative(root.directory, file);
    const withoutExt = relative.replace(/\.php$/, "");
    const nsPath = withoutExt.split(path.sep).join("\\");

    return root.namespace + nsPath;
}

export class Psr4Resolver {
    public resolve(
        file: string,
        root: Psr4Root
    ): string {
        return resolvePsr4(file, root);
    }
}