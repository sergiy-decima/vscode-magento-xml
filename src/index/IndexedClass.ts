export interface IndexedClass 
{
    /**
     * Fully Qualified Class Name
     *
     * Example:
     * Magento\Framework\App\State
     */
    fqcn: string;

    /**
     * Absolute file path
     */
    file: string;

    /**
     * Offset всередині файлу.
     *
     * Поки що = 0.
     * Пізніше Scanner буде заповнювати справжнє значення.
     */
    offset: number;

    /**
     * Довжина токена class/interface/trait.
     */
    length: number;
}