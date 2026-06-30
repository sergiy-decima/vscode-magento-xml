export function extractWord(text: string): string {
    return text.replace(/[^A-Za-z0-9\\]/g, "");
}