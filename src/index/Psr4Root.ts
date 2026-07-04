import * as path from "node:path";

export class Psr4Root {
    public readonly namespace: string;
    public readonly directory: string;
    private readonly directoryPrefix: string;

    constructor(
        namespace: string,
        directory: string
    ) {
        this.namespace = namespace;
        this.directory = path.resolve(directory);
        this.directoryPrefix = this.directory.endsWith(path.sep) ? this.directory : this.directory + path.sep;
    }

    /**
     * Обчислює FQCN по шляху до php-файлу.
     *
     * Приклад:
     *  namespace: Magento\Framework\
     *  directoryPrefix: /app/vendor/magento/framework
     *  file: /app/vendor/magento/framework/App/State.php
     *  => Magento\Framework\App\State
     */
    public resolve(file: string): string {
        let relative = file;
        if (relative.startsWith(this.directoryPrefix)) {
            relative = relative.substring(this.directoryPrefix.length);
        }

        if (relative.endsWith(".php")) {
            relative = relative.substring(0, relative.length - 4);
        }
        relative = relative.split(path.sep).join("\\");

        return this.namespace + relative;
    }
}