/**
 * Preview-phase outbound transport gate.
 * No purchase traffic is authorised until all authenticated demo controls are wired.
 */
export function assertDigitLabOutboundRequestAllowed(payload: unknown): void {
    // Never let uninspectable payloads pass silently.
    if (typeof payload !== 'string') {
        throw new Error('DigitLab: unsupported outbound WebSocket payload blocked');
    }
    let request: unknown;
    try {
        request = JSON.parse(payload);
    } catch {
        throw new Error('DigitLab: unparseable outbound WebSocket payload blocked');
    }
    if (typeof request !== 'object' || request === null || Array.isArray(request)) {
        throw new Error('DigitLab: invalid outbound WebSocket request blocked');
    }
    const fields = request as Record<string, unknown>;
    // Fail closed on trade-creation methods. Never rely on client UI toggles.
    if (Object.prototype.hasOwnProperty.call(fields, 'buy') ||
        Object.prototype.hasOwnProperty.call(fields, 'buy_contract_for') ||
        Object.prototype.hasOwnProperty.call(fields, 'purchase')) {
        throw new Error('DigitLab: outbound contract purchase blocked pending demo verification');
    }
}
