import {
    authoriseDigitLabTrade,
    DIGITLAB_AUTOMATIC_TRADING_ENABLED,
    DIGITLAB_REAL_TRADING_ENABLED,
} from '../digitlab-trading-policy';

describe('DigitLab demo trade policy', () => {
    it('keeps real and automatic trading disabled', () => {
        expect(DIGITLAB_REAL_TRADING_ENABLED).toBe(false);
        expect(DIGITLAB_AUTOMATIC_TRADING_ENABLED).toBe(false);
    });

    it.each(['real', 'unknown'] as const)('blocks %s account types', accountType => {
        expect(authoriseDigitLabTrade({ accountType, isAuthenticated: true, userConfirmedDemoRun: true }).allowed).toBe(false);
    });

    it('blocks unauthenticated execution', () => {
        expect(authoriseDigitLabTrade({ accountType: 'demo', isAuthenticated: false, userConfirmedDemoRun: true }).allowed).toBe(false);
    });

    it('blocks demo execution without explicit confirmation', () => {
        expect(authoriseDigitLabTrade({ accountType: 'demo', isAuthenticated: true, userConfirmedDemoRun: false }).allowed).toBe(false);
    });

    it('permits explicitly confirmed authenticated demo execution only', () => {
        expect(authoriseDigitLabTrade({ accountType: 'demo', isAuthenticated: true, userConfirmedDemoRun: true }))
            .toEqual({ allowed: true, mode: 'demo' });
    });
});
