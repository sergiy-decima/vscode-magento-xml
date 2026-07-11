export interface PhpImport {
    /**
     * Imported FQCN.
     *
     * Example: Magento\Framework\App\State
     */
    fqcn: string;

    /**
     * Alias used inside file.
     *
     * Example: State
     */
    alias: string;
}