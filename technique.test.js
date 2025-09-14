// technique.test.js
// Unit tests for the core encryption/decryption functions
const {
    caesarShiftEncrypt,
    caesarShiftDecrypt,
    vigenereShiftEncrypt,
    vigenereShiftDecrypt,
    generateVigenereTableFromKeyword
} = require('./cipher-utils');

// Test the caesarShiftEncrypt function
describe('caesarShiftEncrypt', () => {
    test('should encrypt uppercase letters correctly', () => {
      expect(caesarShiftEncrypt('A', 3)).toBe('D');
      expect(caesarShiftEncrypt('Z', 1)).toBe('A');
      expect(caesarShiftEncrypt('M', 13)).toBe('Z');
    });
  
    test('should encrypt lowercase letters correctly', () => {
      expect(caesarShiftEncrypt('a', 3)).toBe('d');
      expect(caesarShiftEncrypt('z', 1)).toBe('a');
      expect(caesarShiftEncrypt('m', 13)).toBe('z');
    });
  
    test('should handle wrapping around the alphabet', () => {
      expect(caesarShiftEncrypt('X', 5)).toBe('C');
      expect(caesarShiftEncrypt('y', 10)).toBe('i');
    });
  
    test('should leave non-alphabet characters unchanged', () => {
      expect(caesarShiftEncrypt('!', 3)).toBe('!');
      expect(caesarShiftEncrypt('5', 5)).toBe('5');
      expect(caesarShiftEncrypt(' ', 10)).toBe(' ');
    });
  
    test('should handle shift of 0', () => {
      expect(caesarShiftEncrypt('A', 0)).toBe('A');
      expect(caesarShiftEncrypt('z', 0)).toBe('z');
    });
  
    test('should handle shift of 26 (full rotation)', () => {
      expect(caesarShiftEncrypt('A', 26)).toBe('A');
      expect(caesarShiftEncrypt('m', 26)).toBe('m');
    });
  
    test('should handle large shifts', () => {
      expect(caesarShiftEncrypt('A', 30)).toBe('E');
      expect(caesarShiftEncrypt('z', 55)).toBe('c');
    });
});
  
// Test the caesarShiftDecrypt function
describe('caesarShiftDecrypt', () => {
    test('should decrypt uppercase letters correctly', () => {
      expect(caesarShiftDecrypt('D', 3)).toBe('A');
      expect(caesarShiftDecrypt('A', 1)).toBe('Z');
      expect(caesarShiftDecrypt('Z', 13)).toBe('M');
    });
  
    test('should decrypt lowercase letters correctly', () => {
      expect(caesarShiftDecrypt('d', 3)).toBe('a');
      expect(caesarShiftDecrypt('a', 1)).toBe('z');
      expect(caesarShiftDecrypt('z', 13)).toBe('m');
    });
  
    test('should handle wrapping around the alphabet', () => {
      expect(caesarShiftDecrypt('C', 5)).toBe('X');
      expect(caesarShiftDecrypt('i', 10)).toBe('y');
    });
  
    test('should leave non-alphabet characters unchanged', () => {
      expect(caesarShiftDecrypt('!', 3)).toBe('!');
      expect(caesarShiftDecrypt('5', 5)).toBe('5');
      expect(caesarShiftDecrypt(' ', 10)).toBe(' ');
    });
  
    test('should handle shift of 0', () => {
      expect(caesarShiftDecrypt('A', 0)).toBe('A');
      expect(caesarShiftDecrypt('z', 0)).toBe('z');
    });
  
    test('should handle shift of 26 (full rotation)', () => {
      expect(caesarShiftDecrypt('A', 26)).toBe('A');
      expect(caesarShiftDecrypt('m', 26)).toBe('m');
    });
  
    test('should handle large shifts', () => {
      expect(caesarShiftDecrypt('E', 30)).toBe('A');
      expect(caesarShiftDecrypt('c', 55)).toBe('z');
    });
});
  
// Test encryption/decryption round-trip
describe('Caesar Cipher Round-trip', () => {
    test('should encrypt and then decrypt back to original', () => {
      const testCases = [
        { input: 'HELLO', shift: 3 },
        { input: 'WORLD', shift: 7 },
        { input: 'CRYPTOGRAPHY', shift: 13 },
        { input: 'abcdefghijklmnopqrstuvwxyz', shift: 5 },
        { input: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', shift: 10 }
      ];
  
      testCases.forEach(({ input, shift }) => {
        const encrypted = input.split('').map(char => caesarShiftEncrypt(char, shift)).join('');
        const decrypted = encrypted.split('').map(char => caesarShiftDecrypt(char, shift)).join('');
        expect(decrypted).toBe(input);
      });
    });
});
  
// Test the vigenereShiftEncrypt function
describe('vigenereShiftEncrypt', () => {
    test('should encrypt uppercase letters correctly', () => {
      expect(vigenereShiftEncrypt('A', 'A')).toBe('A');
      expect(vigenereShiftEncrypt('A', 'B')).toBe('B');
      expect(vigenereShiftEncrypt('H', 'K')).toBe('R');
      expect(vigenereShiftEncrypt('Z', 'A')).toBe('Z');
    });
  
    test('should encrypt lowercase letters correctly', () => {
      expect(vigenereShiftEncrypt('a', 'A')).toBe('a');
      expect(vigenereShiftEncrypt('a', 'B')).toBe('b');
      expect(vigenereShiftEncrypt('h', 'K')).toBe('r');
      expect(vigenereShiftEncrypt('z', 'A')).toBe('z');
    });
  
    test('should leave non-alphabet characters unchanged', () => {
      expect(vigenereShiftEncrypt('!', 'A')).toBe('!');
      expect(vigenereShiftEncrypt('5', 'B')).toBe('5');
      expect(vigenereShiftEncrypt(' ', 'C')).toBe(' ');
    });
  
    test('should handle edge cases', () => {
      expect(vigenereShiftEncrypt('A', 'Z')).toBe('Z');
      expect(vigenereShiftEncrypt('Z', 'Z')).toBe('Y');
    });
});
  
// Test the vigenereShiftDecrypt function
describe('vigenereShiftDecrypt', () => {
    test('should decrypt uppercase letters correctly', () => {
      expect(vigenereShiftDecrypt('A', 'A')).toBe('A');
      expect(vigenereShiftDecrypt('B', 'B')).toBe('A');
      expect(vigenereShiftDecrypt('R', 'K')).toBe('H');
      expect(vigenereShiftDecrypt('Z', 'A')).toBe('Z');
    });
  
    test('should decrypt lowercase letters correctly', () => {
      expect(vigenereShiftDecrypt('a', 'A')).toBe('a');
      expect(vigenereShiftDecrypt('b', 'B')).toBe('a');
      expect(vigenereShiftDecrypt('r', 'K')).toBe('h');
      expect(vigenereShiftDecrypt('z', 'A')).toBe('z');
    });
  
    test('should leave non-alphabet characters unchanged', () => {
      expect(vigenereShiftDecrypt('!', 'A')).toBe('!');
      expect(vigenereShiftDecrypt('5', 'B')).toBe('5');
      expect(vigenereShiftDecrypt(' ', 'C')).toBe(' ');
    });
  
    test('should handle edge cases', () => {
      expect(vigenereShiftDecrypt('Z', 'Z')).toBe('A');
      expect(vigenereShiftDecrypt('Y', 'Z')).toBe('Z');
    });
});
  
// Test Vigenère encryption/decryption round-trip
describe('Vigenère Cipher Round-trip', () => {
    test('should encrypt and then decrypt back to original', () => {
      const testCases = [
        { input: 'HELLO', keyChar: 'K' },
        { input: 'WORLD', keyChar: 'E' },
        { input: 'CRYPTOGRAPHY', keyChar: 'Y' },
        { input: 'abcdefghijklmnopqrstuvwxyz', keyChar: 'M' },
        { input: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', keyChar: 'P' }
      ];
  
      testCases.forEach(({ input, keyChar }) => {
        const encrypted = input.split('').map(char => vigenereShiftEncrypt(char, keyChar)).join('');
        const decrypted = encrypted.split('').map(char => vigenereShiftDecrypt(char, keyChar)).join('');
        expect(decrypted).toBe(input);
      });
    });
});
  
// Test utility functions
describe('Utility Functions', () => {
    test('generateVigenereTableFromKeyword should generate correct table', () => {
      const table = generateVigenereTableFromKeyword('KEY');
      expect(table).toHaveLength(3);
      expect(table[0].key).toBe('K');
      expect(table[0].row).toBe('KLMNOPQRSTUVWXYZABCDEFGHIJ');
      expect(table[1].key).toBe('E');
      expect(table[1].row).toBe('EFGHIJKLMNOPQRSTUVWXYZABCD');
      expect(table[2].key).toBe('Y');
      expect(table[2].row).toBe('YZABCDEFGHIJKLMNOPQRSTUVWX');
    });
  
    test('generateVigenereTableFromKeyword should handle empty key', () => {
      const table = generateVigenereTableFromKeyword('');
      expect(table).toHaveLength(0);
    });
  
    test('generateVigenereTableFromKeyword should remove non-alphabet characters', () => {
      const table = generateVigenereTableFromKeyword('K3Y!');
      expect(table).toHaveLength(2);
      expect(table[0].key).toBe('K');
      expect(table[1].key).toBe('Y');
    });
});