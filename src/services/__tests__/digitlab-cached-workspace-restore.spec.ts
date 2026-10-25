import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Cached Blockly XML restoration guards', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/stores/load-modal-store.ts'), 'utf8');
    it('validates cached main workspace XML before reset', () => {
        const block = source.slice(source.indexOf('resetBotBuilderStrategy ='), source.indexOf('loadStrategyToBuilder ='));
        expect(block.indexOf('assertSafeDbotXmlText(workspace.cached_xml.main)')).toBeGreaterThan(-1);
        expect(block.indexOf('assertSafeDbotXmlText(workspace.cached_xml.main)')).toBeLessThan(block.indexOf('asyncClear()'));
    });
    it('validates restored recent workspace XML before clearing workspace', () => {
        const block = source.slice(source.indexOf('loadFileFromRecent ='), source.indexOf('onActiveIndexChange ='));
        expect(block.indexOf('assertSafeDbotXmlText(window.Blockly.derivWorkspace.strategy_to_load)')).toBeGreaterThan(-1);
        expect(block.indexOf('assertSafeDbotXmlText(window.Blockly.derivWorkspace.strategy_to_load)')).toBeLessThan(block.indexOf('asyncClear()'));
    });
});
