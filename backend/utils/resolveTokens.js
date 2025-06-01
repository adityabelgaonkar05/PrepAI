const { unhash } = require("./hashUnhash.js");
const hashtoken = process.env.HASH_TOKEN;

function resolveTokens(encryptedString) {
    try {
        const decrypted = unhash(encryptedString);
        const gum = "XanThium&^Gum";

        const gumIndex = decrypted.indexOf(gum);
        if (gumIndex === -1) return { objectId: null, expiryDate: null };

        const objectId = decrypted.slice(0, gumIndex);
        const timestampPart = decrypted.slice(gumIndex + gum.length + hashtoken.length);

        const timestamp = parseInt(timestampPart);
        if (isNaN(timestamp)) return { objectId: null, expiryDate: null };

        const expiryDate = new Date(timestamp);
        if (isNaN(expiryDate.getTime())) return { objectId: null, expiryDate: null };

        return {
            objectId,
            expiryDate
        };
    } catch (err) {
        return { objectId: null, expiryDate: null };
    }
}

module.exports = resolveTokens;