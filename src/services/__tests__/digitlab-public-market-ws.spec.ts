import { DIGITLAB_PUBLIC_MARKET_WS } from '@/components/shared/utils/config/config';

describe('DigitLab unauthenticated preview market connection', () => {
    it('uses the documented public WebSocket endpoint', () => {
        expect(DIGITLAB_PUBLIC_MARKET_WS).toBe('wss://api.derivws.com/trading/v1/options/ws/public');
        expect(DIGITLAB_PUBLIC_MARKET_WS).not.toContain('otp=');
        expect(DIGITLAB_PUBLIC_MARKET_WS).toMatch(/\/ws\/public$/);
    });
});
