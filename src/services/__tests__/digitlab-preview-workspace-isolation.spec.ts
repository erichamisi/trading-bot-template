import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('DBot recent strategy preview isolation', () => {
    it('loads preview XML into its own Blockly workspace rather than the active editor', () => {
        const code = readFileSync(resolve(process.cwd(), 'src/stores/load-modal-store.ts'), 'utf8');
        const start = code.indexOf('loadStrategyOnModalRecentPreview =');
        const end = code.indexOf('loadStrategyOnModalLocalPreview =', start);
        const preview = code.slice(start, end);
        expect(preview).toContain('assertSafeDbotXmlText(this.selected_strategy?.xml)');
        expect(preview).toContain('clearWorkspaceAndLoadFromXml(convertedDom, this.recent_workspace)');
        expect(preview).not.toContain('getMainWorkspace()');
    });
});
