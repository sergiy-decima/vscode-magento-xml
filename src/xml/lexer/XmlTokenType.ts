export enum XmlTokenType
{
    OpenTag,           // <
    CloseTag,          // >
    OpenCloseTag,      // </
    SelfCloseTag,      // />

    Identifier,
    String,
    Text,

    Equals,

    EOF
}