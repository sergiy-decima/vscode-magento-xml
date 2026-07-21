import { XmlTokenType } from "./XmlTokenType";

export interface XmlToken
{
    type: XmlTokenType;

    text: string;

    offset: number;

    length: number;
}