const crypto = require('crypto');

function getDiscriminator(name) {
    const hash = crypto.createHash('sha256').update(`global:${name}`).digest();
    return hash.slice(0, 8).toString('hex');
}

const instructions = ['init_player', 'initPlayer', 'explore', 'fight', 'claim', 'equip'];
console.log('DISCRIMINATORS:');
instructions.forEach(name => {
    console.log(`${name}: ${getDiscriminator(name)}`);
});
