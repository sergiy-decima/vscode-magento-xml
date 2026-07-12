import { PhpParserBase } from "./PhpParserBase";
import { PhpTokenStream } from "./PhpTokenStream";
import { PhpReferenceList } from "./PhpReferenceList";
import { PhpReferenceKind } from "../ast/PhpReference";
import { TokenType } from "../lexer/TokenType";
import { PhpTypeNameParser } from "./PhpTypeNameParser";

export class PhpMethodBodyParser extends PhpParserBase {
    public parse(): void {
        this.skipBlock();
    }
}

// /**
//  * Parses method body and collects type references.
//  *
//  * Examples:
//  * new Foo()
//  * Foo::bar()
//  * Foo::CONST
//  * $x instanceof Foo
//  */
// export class PhpMethodBodyParser extends PhpParserBase {
//     private readonly typeParser: PhpTypeNameParser;

//     public constructor(
//         stream: PhpTokenStream,
//         private readonly references: PhpReferenceList
//     ) {
//         super(stream);
//         this.typeParser = new PhpTypeNameParser(stream);
//     }

//     /**
//      * Current token must be "{"
//      */
//     public parse(): void {
//         if (!this.match(TokenType.OpenBrace)) {
//             return;
//         }

//         let level = 1;
//         while (!this.eof() && level > 0) {
//             if (this.match(TokenType.OpenBrace)) {
//                 level++;
//                 continue;
//             }

//             if (this.match(TokenType.CloseBrace)) {
//                 level--;
//                 continue;
//             }

//             this.readReference();
//             this.next();
//         }
//     }

//     /**
//      * Reads:
//      *
//      * new Foo
//      * Foo::bar()
//      * Foo::CONST
//      * $x instanceof Foo
//      */
//     private readReference(): void {
//         switch (this.tokenType()) {
//             case TokenType.New:
//                 this.readNew();
//                 return;

//             case TokenType.Instanceof:
//                 this.readInstanceof();
//                 return;

//             case TokenType.Identifier:
//                 this.readStaticReference();
//                 return;
//         }
//     }

//     /**
//      * new Foo()
//      */
//     private readNew(): void {
//         this.next();
//         const token = this.token();
//         const type = this.typeParser.parse();

//         if (!type) {
//             return;
//         }

//         this.references.add(
//             type.replace(/^\?/, ""),
//             token.offset,
//             token.length,
//             PhpReferenceKind.New
//         );
//     }

//     /**
//      * Reads:
//      *
//      * $x instanceof Foo
//      */
//     private readInstanceof(): void {
//         this.next();
//         const token = this.token();
//         const type = this.typeParser.parse();

//         if (!type) {
//             return;
//         }

//         this.references.add(
//             type.replace(/^\?/, ""),
//             token.offset,
//             token.length,
//             PhpReferenceKind.Instanceof
//         );
//     }

//     /**
//      * Reads:
//      *
//      * Foo::bar()
//      * Foo::CONST
//      */
//     private readStaticReference(): void {
//         const token = this.token();
//         const type = this.typeParser.parse();
//         if (!type) {
//             return;
//         }

//         if (!this.match(TokenType.DoubleColon)) {
//             return;
//         }

//         this.references.add(
//             type.replace(/^\?/, ""),
//             token.offset,
//             token.length,
//             PhpReferenceKind.StaticAccess
//         );
//     }
// }