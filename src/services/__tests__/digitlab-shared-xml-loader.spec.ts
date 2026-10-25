import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Shared DBot strategy import guard wiring', () => {
    it('validates strategy XML before DOMParser and Blockly conversion for every load source', () => {
        const source = readFileSync(resolve(process.cwd(), 'src/external/bot-skeleton/scratch/utils/index.js'), 'utf8');
        const guard = source.indexOf('assertSafeDbotXmlText(block_string);');
        const parser = source.indexOf('new DOMParser().parseFromString(block_string');
        const blockly = source.indexOf('window.Blockly.utils.xml.textToDom(block_string)');
        expect(guard).toBeGreaterThan(-1);
        expect(parser).toBeGreaterThan(guard);
        expect(blockly).toBeGreaterThan(guard);
    });
});
