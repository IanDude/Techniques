const { caesarShiftEncrypt, caesarShiftDecrypt } = require('../techniquescript');
const assert = require('assert');

describe('Caesar Cipher', () => {
    it('should encrypt a single character with shift 3', () => {
        assert.strictEqual(caesarShiftEncrypt('A', 3), 'D');
        assert.strictEqual(caesarShiftEncrypt('a', 3), 'd');
        assert.strictEqual(caesarShiftEncrypt('Z', 3), 'C');
        assert.strictEqual(caesarShiftEncrypt('z', 3), 'c');
    });

    it('should decrypt a single character with shift 3', () => {
        assert.strictEqual(caesarShiftDecrypt('D', 3), 'A');
        assert.strictEqual(caesarShiftDecrypt('d', 3), 'a');
        assert.strictEqual(caesarShiftDecrypt('C', 3), 'Z');
        assert.strictEqual(caesarShiftDecrypt('c', 3), 'z');
    });

    it('should handle non-alphabetic characters', () => {
        assert.strictEqual(caesarShiftEncrypt('!', 3), '!');
        assert.strictEqual(caesarShiftDecrypt('@', 3), '@');
    });
});
