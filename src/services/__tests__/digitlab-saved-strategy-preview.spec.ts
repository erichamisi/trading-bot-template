import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Direct saved Blockly preview paths', () => {
    it('validates saved strategy before preview XML conversion and workspace mutation', () => {
        const source = readFileSync(resolve(process.cwd(), 'src/stores/load-modal-store.ts'), 'utf8');
        const selection = source.slice(source.indexOf('updateXmlValuesOnStrategySelection ='), source.indexOf('loadStrategyOnModalRecentPreview ='));
        const preview = source.slice(source.indexOf('loadStrategyOnModalRecentPreview ='), source.indexOf('loadStrategyOnModalLocalPreview ='));
        expect(selection.indexOf('assertSafeDbotXmlText(this.selected_strategy?.xml)')).toBeGreaterThan(-1);
        expect(selection.indexOf('assertSafeDbotXmlText(this.selected_strategy?.xml)')).toBeLessThan(selection.indexOf('textToDom(this.selected_strategy?.xml)'));
        expect(preview.indexOf('assertSafeDbotXmlText(this.selected_strategy?.xml)')).toBeGreaterThan(-1);
        expect(preview.indexOf('assertSafeDbotXmlText(this.selected_strategy?.xml)')).toBeLessThan(preview.indexOf('textToDom(this.selected_strategy?.xml)'));
    });
});
