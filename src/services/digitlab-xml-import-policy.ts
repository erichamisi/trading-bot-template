/**
 * Preliminary local XML upload checks. These protect the Blockly import path
 * from oversized/obviously unsafe files; Blockly schema validation remains
 * responsible for deciding whether a strategy is compatible.
 */
export const MAX_DBOT_XML_BYTES = 1_048_576; // 1 MiB

export function assertSafeDbotXmlFile(file: { name: string; size: number } | null | undefined): void {
    if (!file || typeof file.name !== 'string' || !/\.xml$/i.test(file.name)) {
        throw new Error('Only .xml strategy files can be imported');
    }
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_DBOT_XML_BYTES) {
        throw new Error('Strategy XML must be between 1 byte and 1 MiB');
    }
}

export function assertSafeDbotXmlText(text: unknown): asserts text is string {
    if (typeof text !== 'string' || !text.trim()) {
        throw new Error('Strategy XML cannot be empty');
    }
    // Block XML declarations that can enable dangerous external entities or
    // surprise custom entity expansion in downstream parsers.
    if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(text)) {
        throw new Error('DTD and entity declarations are not permitted in strategy XML');
    }
    if (!/^\s*(?:<\?xml\s+[^?]*\?>\s*)?<xml(?:\s|>)/i.test(text)) {
        throw new Error('Expected a Blockly <xml> strategy document');
    }
    if (new TextEncoder().encode(text).byteLength > MAX_DBOT_XML_BYTES) {
        throw new Error('Strategy XML exceeds 1 MiB');
    }
}
