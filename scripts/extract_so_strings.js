const fs = require('fs');
const path = require('path');

const soPath = path.join(__dirname, '..', 'target', 'deploy', 'proof_of_play.so');
const buf = fs.readFileSync(soPath);

// Extract ascii strings of length 4-64
const strings = [];
let current = "";
for (let i = 0; i < buf.length; i++) {
    const char = buf[i];
    if (char >= 32 && char <= 126) {
        current += String.fromCharCode(char);
    } else {
        if (current.length >= 4 && current.length <= 64) {
            strings.push(current);
        }
        current = "";
    }
}

// Filter for potential Anchor instruction names (lowercase with underscores)
const potentialIxs = strings.filter(s => /^[a-z_]+$/.test(s));
console.log('POTENTIAL INSTRUCTION NAMES FOUND IN .SO:');
console.log([...new Set(potentialIxs)].join(', '));

// Also look for CamelCase names
const camelIxs = strings.filter(s => /^[a-zA-Z]+$/.test(s));
console.log('POTENTIAL CAMELCASE NAMES FOUND IN .SO:');
console.log([...new Set(camelIxs)].join(', '));
