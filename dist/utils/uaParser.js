"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUA = void 0;
const parseUA = (ua) => {
    const uaLower = ua.toLowerCase();
    // 1. Detect OS
    let os = 'Unknown';
    if (uaLower.includes('windows')) {
        os = 'Windows';
    }
    else if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) {
        if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) {
            os = 'iOS';
        }
        else {
            os = 'macOS';
        }
    }
    else if (uaLower.includes('android')) {
        os = 'Android';
    }
    else if (uaLower.includes('linux')) {
        os = 'Linux';
    }
    else if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) {
        os = 'iOS';
    }
    // 2. Detect Device Type
    let deviceType = 'Desktop';
    if (/mobile|android|iphone|ipod|iemobile|blackberry|fennec|opera mini|silk/i.test(uaLower)) {
        deviceType = 'Mobile';
    }
    if (/ipad|tablet|playbook|kindle/i.test(uaLower)) {
        deviceType = 'Tablet';
    }
    // 3. Detect Browser
    let browser = 'Unknown';
    if (uaLower.includes('firefox')) {
        browser = 'Firefox';
    }
    else if (uaLower.includes('opr') || uaLower.includes('opera')) {
        browser = 'Opera';
    }
    else if (uaLower.includes('edg')) {
        browser = 'Edge';
    }
    else if (uaLower.includes('chrome') || uaLower.includes('crios')) {
        browser = 'Chrome';
    }
    else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
        browser = 'Safari';
    }
    return {
        deviceType,
        browser,
        os,
    };
};
exports.parseUA = parseUA;
