import * as vscode from "vscode";

import { XmlDocument } from "../ast/XmlDocument";
import { XmlNode } from "../ast/XmlNode";
import { XmlAttribute } from "../ast/XmlAttribute";

import { XmlParserBase } from "./XmlParserBase";
import { XmlTokenStream } from "./XmlTokenStream";

import { XmlTokenType } from "../lexer/XmlTokenType";

export class XmlDocumentParser
    extends XmlParserBase
{
    private readonly root: XmlNode;

    public constructor(
        stream: XmlTokenStream,
        uri: vscode.Uri
    ) {
        super(stream);

        this.root = new XmlNode(
            "#document",
            uri,
            0,
            Number.MAX_SAFE_INTEGER,
            []
        );
    }

    public parse(): XmlDocument
    {
        while (!this.eof()) {

            const node = this.readElement();

            if (node) {
                this.root.addChild(node);
                continue;
            }

            this.next();
        }

        return new XmlDocument(this.root);
    }

    private readElement(): XmlNode | undefined
    {
        if (!this.match(XmlTokenType.OpenTag)) {
            return;
        }

        if (
            this.tokenType() !==
            XmlTokenType.Identifier
        ) {
            return;
        }

        const tag = this.token();

        this.next();

        const attributes: XmlAttribute[] = [];

        while (!this.eof()) {

            if (
                this.tokenType() ===
                XmlTokenType.Identifier
            ) {

                attributes.push(
                    this.readAttribute()
                );

                continue;
            }

            break;
        }

        const node = new XmlNode(
            tag.text,
            this.root.uri,
            tag.offset,
            0,
            attributes
        );

                //
        // <tag />
        //
        if (
            this.match(
                XmlTokenType.SelfCloseTag
            )
        ) {
            return new XmlNode(
                tag.text,
                this.root.uri,
                tag.offset,
                this.token().offset - tag.offset,
                attributes
            );
        }

        //
        // <tag>
        //
        if (
            !this.match(
                XmlTokenType.CloseTag
            )
        ) {
            return node;
        }

        while (!this.eof()) {

            //
            // text
            //
            if (
                this.tokenType() ===
                XmlTokenType.Text
            ) {
                this.next();
                continue;
            }

            //
            // child
            //
            const child = this.readElement();

            if (child) {
                node.addChild(child);
                continue;
            }

            //
            // </tag>
            //
            if (
                this.match(
                    XmlTokenType.OpenCloseTag
                )
            ) {
                break;
            }

            this.next();
        }

        //
        // closing tag name
        //
        if (
            this.tokenType() ===
            XmlTokenType.Identifier
        ) {
            this.next();
        }

        //
        // >
        //
        let end = tag.offset;

        if (
            this.tokenType() ===
            XmlTokenType.CloseTag
        ) {
            end =
                this.token().offset +
                this.token().length;

            this.next();
        }

        node.length = end - tag.offset;

        return node;
    }

    private readAttribute(): XmlAttribute
    {
        const name = this.token().text;

        this.next();

        this.match(
            XmlTokenType.Equals
        );

        const value = this.token();

        this.next();

        return {
            name,
            value: value.text,
            offset: value.offset,
            length: value.length
        };
    }
}