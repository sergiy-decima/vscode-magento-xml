export const enum XmlTokenType
{
    OpenTag,
    CloseTag,
    SelfClosingTag,
    Text
}

export interface XmlTokenAttribute
{
    name: string;

    value: string;

    offset: number;

    length: number;
}

export interface XmlToken
{
    type: XmlTokenType;

    name: string;

    offset: number;

    length: number;

    attributes: XmlTokenAttribute[];
}