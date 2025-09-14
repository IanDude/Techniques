// cipher-utils.js
// Pure cipher functions that can be tested in isolation

function caesarShiftEncrypt(char, shift) {
    const code = char.charCodeAt(0);
    
    if (code >= 65 && code <= 90) { // Uppercase
        const base = 65;
        const effectiveShift = shift % 26;
        const shifted = (code - base + effectiveShift + 26) % 26;
        return String.fromCharCode(shifted + base);
    } else if (code >= 97 && code <= 122) { // Lowercase
        const base = 97;
        const effectiveShift = shift % 26;
        const shifted = (code - base + effectiveShift + 26) % 26;
        return String.fromCharCode(shifted + base);
    } else {
        return char;
    }
}

function caesarShiftDecrypt(char, shift) {
    const code = char.charCodeAt(0);
    
    if (code >= 65 && code <= 90) { // Uppercase
        const base = 65;
        const effectiveShift = shift % 26;
        const shifted = (code - base - effectiveShift + 26) % 26;
        return String.fromCharCode(shifted + base);
    } else if (code >= 97 && code <= 122) { // Lowercase
        const base = 97;
        const effectiveShift = shift % 26;
        const shifted = (code - base - effectiveShift + 26) % 26;
        return String.fromCharCode(shifted + base);
    } else {
        return char;
    }
}

function vigenereShiftEncrypt(char, keyChar) {
    if (typeof char !== 'string' || char.length === 0) return char;
    if (typeof keyChar !== 'string' || keyChar.length === 0) return char;
    
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        const shift = keyChar.toUpperCase().charCodeAt(0) - 65;
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
        const shift = keyChar.toLowerCase().charCodeAt(0) - 97;
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }
    return char;
}

function vigenereShiftDecrypt(char, keyChar) {
    if (typeof char !== 'string' || char.length === 0) return char;
    if (typeof keyChar !== 'string' || keyChar.length === 0) return char;
    
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        const shift = keyChar.toUpperCase().charCodeAt(0) - 65;
        return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
        const shift = keyChar.toLowerCase().charCodeAt(0) - 97;
        return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    }
    return char;
}

function generateVigenereTableFromKeyword(keyword) {
    if (!keyword || typeof keyword !== 'string') return [];
    
    // Filter out non-alphabet characters and convert to uppercase
    const cleanKeyword = keyword
        .toUpperCase()
        .split('')
        .filter(char => char >= 'A' && char <= 'Z');
        
    // Remove duplicates while preserving order
    const uniqueChars = [];
    const seen = new Set();
    for (const char of cleanKeyword) {
        if (!seen.has(char)) {
            seen.add(char);
            uniqueChars.push(char);
        }
    }
    
    return uniqueChars.map(char => ({
        key: char,
        row: String.fromCharCode(...Array(26).fill(0).map((_, i) => 
            ((char.charCodeAt(0) - 65 + i) % 26) + 65
        ))
    }));
}

function columnarTranspositionEncrypt(message, key, padWithX = true) {
    if (!message) return '';
    
    // Clean inputs - only keep letters and convert to uppercase
    const cleanMessage = message.replace(/[^A-Za-z]/g, '').toUpperCase();
    const cleanKey = key.toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (!cleanKey.length) return cleanMessage;
    
    const keyLength = cleanKey.length;
    const messageLength = cleanMessage.length;
    
    if (messageLength === 0) return '';
    
    // Determine number of rows needed
    const numRows = Math.ceil(messageLength / keyLength);
    
    // Pad the message if needed
    let paddedMessage = cleanMessage;
    let finalLength = messageLength;
    if (padWithX && messageLength % keyLength !== 0) {
        const paddingNeeded = keyLength - (messageLength % keyLength);
        paddedMessage += 'X'.repeat(paddingNeeded);
        finalLength += paddingNeeded;
    }
    
    // Create array of {char, value, originalIndex} for the key
    const keyItems = [];
    const isNumericKey = /^\d+$/.test(cleanKey);
    
    for (let i = 0; i < keyLength; i++) {
        const char = cleanKey[i];
        keyItems.push({
            char: char,
            value: isNumericKey ? parseInt(char, 10) : char.charCodeAt(0),
            originalIndex: i
        });
    }
    
    // Sort key items by value, then by original position to get reading order
    const sortedKeyItems = [...keyItems].sort((a, b) => {
        if (a.value !== b.value) return a.value - b.value;
        return a.originalIndex - b.originalIndex;
    });
    
    // Create mapping from original column index to its position in sorted order
    const columnReadOrder = new Array(keyLength);
    sortedKeyItems.forEach((item, sortedIndex) => {
        columnReadOrder[item.originalIndex] = sortedIndex;
    });
    
    // Build the result by reading columns in sorted order
    let result = '';
    
    // For each column in sorted order (0, 1, 2, ...)
    for (let sortedCol = 0; sortedCol < keyLength; sortedCol++) {
        // Find which original column corresponds to this sorted position
        const originalCol = sortedKeyItems[sortedCol].originalIndex;
        
        // Read down this column
        for (let row = 0; row < numRows; row++) {
            const pos = row * keyLength + originalCol;
            if (pos < finalLength) {
                result += paddedMessage[pos];
            }
        }
    }
    
    return result;
}

module.exports = {
    caesarShiftEncrypt,
    caesarShiftDecrypt,
    vigenereShiftEncrypt,
    vigenereShiftDecrypt,
    generateVigenereTableFromKeyword,
    columnarTranspositionEncrypt
};
