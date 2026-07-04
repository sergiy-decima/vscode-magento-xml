import * as path from "node:path";

export interface Psr4Root {
    namespace: string;
    directory: string;
}

export class Psr4Resolver {
    public resolve(
        file: string,
        root: Psr4Root
    ): string {
        const relative = path.relative(root.directory, file);
        const withoutExt = relative.replace(/\.php$/, "");

        return (
            root.namespace +
            withoutExt.split(path.sep).join("\\")
        );
    }
}