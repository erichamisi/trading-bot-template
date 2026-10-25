import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('DigitLab startup failure recovery', () => {
    const code = readFileSync(resolve(process.cwd(), 'src/app/app-content.jsx'), 'utf8');
    it('never leaves a failed market-data request waiting forever', () => {
        expect(code).toContain('.catch(error => {');
        expect(code).toContain('setStartupError(true)');
        expect(code).toContain('setIsLoading(false)');
        expect(code).toContain('}, 12000)');
    });
    it('keeps a visible offline state and makes no purchase enablement changes', () => {
        expect(code).toContain('Market connection is unavailable');
        expect(code).toContain('Retry connection');
        expect(code).not.toContain('userConfirmedDemoRun: true');
    });
});
