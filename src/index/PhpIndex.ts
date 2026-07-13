// import { PhpType } from "../php/ast/PhpType";

// export class PhpIndex {
//     private readonly types = new Map<string, PhpType>();

//     public add(type: PhpType): void {
//         this.types.set(type.fqcn, type);
//     }

//     public get(fqcn: string): PhpType | undefined {
//         return this.types.get(fqcn);
//     }

//     public has(fqcn: string): boolean {
//         return this.types.has(fqcn);
//     }

//     public values(): IterableIterator<PhpType> {
//         return this.types.values();
//     }

//     public clear(): void {
//         this.types.clear();
//     }

//     public get size(): number {
//         return this.types.size;
//     }
// }