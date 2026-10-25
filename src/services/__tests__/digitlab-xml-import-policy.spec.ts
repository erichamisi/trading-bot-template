import {
    MAX_DBOT_XML_BYTES,
    assertSafeDbotXmlFile,
    assertSafeDbotXmlText,
} from '../digitlab-xml-import-policy';

describe('DigitLab XML import policy', () => {
    it('accepts a small XML strategy file', () => {
        expect(() => assertSafeDbotXmlFile({ name: 'strategy.xml', size: 128 })).not.toThrow();
    });
    it.each([
        { name: 'strategy.xml.exe', size: 128 },
        { name: 'notxml.txt', size: 128 },
        { name: 'strategy.xml', size: 0 },
        { name: 'strategy.xml', size: MAX_DBOT_XML_BYTES + 1 },
    ])('rejects invalid XML file metadata %#', file => {
        expect(() => assertSafeDbotXmlFile(file)).toThrow();
    });
    it('accepts standard Blockly XML', () => {
        expect(() => assertSafeDbotXmlText('<xml xmlns="https://developers.google.com/blockly/xml"><block type="text" /></xml>')).not.toThrow();
    });
    it.each([
        '',
        'not xml',
        '<!DOCTYPE xml [<!ENTITY x SYSTEM "file:///etc/passwd">]><xml></xml>',
        '<!ENTITY x "value"><xml></xml>',
        '<html></html>',
    ])('rejects unsupported XML content', xml => {
        expect(() => assertSafeDbotXmlText(xml)).toThrow();
    });
});
