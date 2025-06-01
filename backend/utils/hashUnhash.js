const crypto = require('crypto');
const hashtoken = process.env.HASH_TOKEN; 

const algorithm = 'aes-256-cbc';
const ivLength = 16;

function hash(stringToHash) {
    const currentTime = Date.now();
    const timeAfter7Days = currentTime + 7 * 24 * 60 * 60 * 1000;
    const data = stringToHash + "XanThium&^Gum" + hashtoken + timeAfter7Days;

    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(hashtoken, 'utf8'), iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
}

function unhash(encryptedString) {
    const [ivBase64, encryptedData] = encryptedString.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(hashtoken, 'utf8'), iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

exports.hash = hash;
exports.unhash = unhash;