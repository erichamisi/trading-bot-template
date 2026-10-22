/**
 * DigitLab preview transport guard.
 * All account-mutating operations remain blocked until reviewed demo-only flow.
 * Browser-side guard only: it does not replace server-side authorisation.
 */
const RESTRICTED_METHODS = [
    'buy', 'buy_contract_for', 'purchase', 'sell', 'cancel',
    'contract_update', 'cashier', 'paymentagent_transfer',
    'transfer_between_accounts', 'p2p_order_create',
] as const;

export function assertDigitLabOutboundRequestAllowed(payload: unknown): void {
    if (typeof payload !== 'string') {
        throw new Error('DigitLab: unsupported outbound WebSocket payload blocked');
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(payload);
    } catch {
        throw new Error('DigitLab: unparseable outbound WebSocket payload blocked');
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('DigitLab: invalid outbound WebSocket request blocked');
    }
    const request = parsed as Record<string, unknown>;
    // Only accept own request fields; a mutation may have a falsy value.
    if (RESTRICTED_METHODS.some(key => Object.prototype.hasOwnProperty.call(request, key))) {
        throw new Error('DigitLab: account-modifying request blocked pending demo verification');
    }
}
