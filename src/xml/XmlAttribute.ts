export interface XmlAttribute
{
    /**
     * Attribute name.
     *
     * Example:
     * instance
     */
    name: string;

    /**
     * Attribute value.
     *
     * Example:
     * Magento\Framework\App\State
     */
    value: string;

    /**
     * Offset of attribute value.
     */
    offset: number;

    /**
     * Length of attribute value.
     */
    length: number;
}