import { assertDigitLabOutboundRequestAllowed } from '../digitlab-outbound-policy';

describe('DigitLab WebSocket transport safeguard', () => {
    it.each([
        '{"buy":"proposal","price":1}',
        '{"buy":1}',
        '{"buy_contract_for":"x"}',
        '{"purchase":1}',
        '{"sell":1}',
        '{"cancel":1}',
        '{"contract_update":1}',
        '{"transfer_between_accounts":1}',
        '{"cashier":"withdraw"}',
        '{"buy":null}',
    ])('blocks purchase-shaped request %s', payload => {
        expect(() => assertDigitLabOutboundRequestAllowed(payload)).toThrow(/blocked/);
    });
    it('permits public market-data requests', () => {
        expect(() => assertDigitLabOutboundRequestAllowed('{"ticks":"R_10","subscribe":1}')).not.toThrow();
    });
    it.each(['not-json', 'null', '[]'])('rejects invalid messages %s', payload => {
        expect(() => assertDigitLabOutboundRequestAllowed(payload)).toThrow();
    });
    it('rejects non-string socket writes', () => {
        expect(() => assertDigitLabOutboundRequestAllowed(new Uint8Array([1, 2]))).toThrow();
    });
});
