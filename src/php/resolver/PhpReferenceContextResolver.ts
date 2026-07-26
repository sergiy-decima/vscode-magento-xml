interface PhpReferenceContext {
    kind: "class" | "method" | "property" | "constant";
    className: string;
    memberName?: string;
}