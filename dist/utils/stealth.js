"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deobfuscate = exports.obfuscate = void 0;
const SECRET_KEY = "blank_page_stealth_key_2026";
const obfuscate = (text) => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
        result += String.fromCharCode(charCode);
    }
    return Buffer.from(encodeURIComponent(result)).toString('base64');
};
exports.obfuscate = obfuscate;
const deobfuscate = (encoded) => {
    try {
        const decoded = decodeURIComponent(Buffer.from(encoded, 'base64').toString('ascii'));
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    }
    catch (e) {
        console.error("De-obfuscation failed:", e);
        return "";
    }
};
exports.deobfuscate = deobfuscate;
