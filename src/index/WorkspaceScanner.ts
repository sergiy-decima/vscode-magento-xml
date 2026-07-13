// import { Uri } from "vscode";
// import { WorkspaceIndex } from "./WorkspaceIndex";

// export class WorkspaceScanner {
//     public async index(workspace: Uri): Promise<WorkspaceIndex> {
//         const index = new WorkspaceIndex();
//         const files = await this.findPhpFiles(workspace);
//         for (const file of files) {
//             const phpType = await this.parse(file);
//             if (phpType) {
//                 index.php.add(phpType);
//             }
//         }

//         return index;
//     }

//     public async findPhpFiles(): Promise<Uri[]> {
//     }
// }