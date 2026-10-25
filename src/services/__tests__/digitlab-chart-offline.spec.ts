import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('DBot disconnected chart state', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/pages/chart/chart.tsx'), 'utf8');

    it('shows a useful offline state instead of an indefinite market-data spinner', () => {
        expect(source).toContain('connectionStatus !== CONNECTION_STATUS.OPENED');
        expect(source).toContain('chartData.activeSymbols.length === 0');
        expect(source).toContain('Market chart unavailable');
        expect(source).toContain("data-testid='digitlab-chart-offline'");
        expect(source).not.toContain("<ChunkLoader message='' />");
    });

    it('cleans up subscriptions defensively when no chart socket exists', () => {
        expect(source).toContain("chart_api.api?.forgetAll?.('ticks')");
    });
});
