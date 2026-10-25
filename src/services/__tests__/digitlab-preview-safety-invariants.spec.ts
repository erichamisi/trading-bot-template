/**
 * Regression tripwires for the isolated demo-only preview.
 *
 * These tests verify that existing purchase and socket choke points have not
 * been accidentally removed during upstream DBot code imports/refactors.
 * They are NOT a substitute for runtime end-to-end or backend/broker checks.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('DigitLab demo-preview execution invariants', () => {
    it('retains fail-closed purchase confirmation until trusted demo consent is implemented', () => {
        const purchase = source('src/external/bot-skeleton/services/tradeEngine/trade/Purchase.js');
        expect(purchase).toContain('userConfirmedDemoRun: false');
        expect(purchase).toContain('authoriseDigitLabTrade');
        expect(purchase).toMatch(/purchase\(contract_type\)\s*\{\s*this\.assertDigitLabDemoPermission\(\)/);
        expect((purchase.match(/this\.assertDigitLabDemoPermission\(\)/g) || []).length).toBeGreaterThanOrEqual(3);
    });

    it('retains socket-level request interception before network send', () => {
        const socket = source('src/external/bot-skeleton/services/api/appId.js');
        expect(socket).toContain('assertDigitLabOutboundRequestAllowed(payload);');
        expect(socket).toMatch(/deriv_socket\.send\s*=\s*payload\s*=>/);
        expect(socket.indexOf('assertDigitLabOutboundRequestAllowed(payload);')).toBeLessThan(
            socket.indexOf('return originalSend(payload);')
        );
    });

    it('keeps real and automatic trading disabled by default', () => {
        const policy = source('src/services/digitlab-trading-policy.ts');
        expect(policy).toMatch(/DIGITLAB_REAL_TRADING_ENABLED\s*=\s*false/);
        expect(policy).toMatch(/DIGITLAB_AUTOMATIC_TRADING_ENABLED\s*=\s*false/);
    });

    it('retains socket protection for purchase and account mutation methods', () => {
        const policy = source('src/services/digitlab-outbound-policy.ts');
        for (const action of ['buy', 'buy_contract_for', 'purchase', 'sell', 'cancel', 'contract_update', 'cashier']) {
            expect(policy).toContain(`'${action}'`);
        }
        expect(policy).toContain('Object.prototype.hasOwnProperty.call(request, key)');
    });
});
