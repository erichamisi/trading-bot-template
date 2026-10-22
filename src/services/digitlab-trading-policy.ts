/**
 * DigitLab trade permission boundary. Fail closed until deliberately integrated
 * with every execution entry point and tested against authoritative account data.
 *
 * Adding this file does NOT, by itself, restrict the upstream bot runtime.
 */
export type DigitLabAccountType = 'demo' | 'real' | 'unknown';

export interface DigitLabTradingContext {
    accountType: DigitLabAccountType;
    isAuthenticated: boolean;
    userConfirmedDemoRun: boolean;
}

export type DigitLabTradingPermission =
    | { allowed: true; mode: 'demo' }
    | { allowed: false; reason: string };

// No real-money orders or unattended trading authorised in this phase.
export const DIGITLAB_REAL_TRADING_ENABLED = false as const;
export const DIGITLAB_AUTOMATIC_TRADING_ENABLED = false as const;

export function authoriseDigitLabTrade(context: DigitLabTradingContext): DigitLabTradingPermission {
    if (!context.isAuthenticated) return { allowed: false, reason: 'Authentication required' };
    if (context.accountType !== 'demo') return { allowed: false, reason: 'Demo account required' };
    if (!context.userConfirmedDemoRun) return { allowed: false, reason: 'Explicit demo run confirmation required' };
    return { allowed: true, mode: 'demo' };
}
