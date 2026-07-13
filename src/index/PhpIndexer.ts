// import { Uri } from "vscode";
// import { PhpIndex } from "./PhpIndex";

// export class PhpIndexer {
//     constructor(
//         private readonly parserFactory: PhpParserFactory,
//         private readonly index: PhpIndex,
//     ) {}

//     public async index(uri: Uri): Promise<void> {
//         const parser = await this.parserFactory.create(uri);
//         const type = parser.parse();
//         if (type) {
//             this.index.add(type);
//         }
//     }
// }