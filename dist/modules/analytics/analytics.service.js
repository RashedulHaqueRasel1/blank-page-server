"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const uaParser_1 = require("../../utils/uaParser");
const fetchGeoLocation = (ip, visitorId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if local IP
        if (ip === '::1' ||
            ip === '127.0.0.1' ||
            ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('::ffff:127.0.0.1')) {
            yield prisma_1.default.visitor.update({
                where: { id: visitorId },
                data: {
                    country: 'Localhost',
                    city: 'Localhost',
                },
            });
            return;
        }
        const response = yield fetch(`http://ip-api.com/json/${ip}`);
        const data = yield response.json();
        if (data && data.status === 'success') {
            yield prisma_1.default.visitor.update({
                where: { id: visitorId },
                data: {
                    country: data.country || 'Unknown',
                    city: data.city || 'Unknown',
                },
            });
        }
    }
    catch (error) {
        console.error('Failed to fetch geolocation for IP:', ip, error);
    }
});
const trackVisit = (ip, userAgent, referrer) => __awaiter(void 0, void 0, void 0, function* () {
    // Normalize IP
    const normalizedIp = ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip;
    const existingVisitor = yield prisma_1.default.visitor.findUnique({
        where: {
            ip_userAgent: {
                ip: normalizedIp,
                userAgent,
            },
        },
    });
    if (existingVisitor) {
        const updated = yield prisma_1.default.visitor.update({
            where: { id: existingVisitor.id },
            data: {
                visitCount: { increment: 1 },
                lastVisit: new Date(),
                referrer: referrer || existingVisitor.referrer,
            },
        });
        return updated;
    }
    // Parse details
    const { deviceType, browser, os } = (0, uaParser_1.parseUA)(userAgent);
    const newVisitor = yield prisma_1.default.visitor.create({
        data: {
            ip: normalizedIp,
            userAgent,
            deviceType,
            browser,
            os,
            referrer: referrer || 'Direct',
            country: 'Fetching...',
            city: 'Fetching...',
        },
    });
    // Fetch geo-location in background asynchronously
    fetchGeoLocation(normalizedIp, newVisitor.id);
    return newVisitor;
});
const getStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalVisitors, visitors] = yield Promise.all([
        prisma_1.default.visitor.count(),
        prisma_1.default.visitor.findMany({
            select: {
                visitCount: true,
                deviceType: true,
                browser: true,
                country: true,
                os: true,
            },
        }),
    ]);
    // Aggregate total visits
    const totalVisits = visitors.reduce((sum, v) => sum + v.visitCount, 0);
    // Group metrics
    const devices = {};
    const browsers = {};
    const countries = {};
    const operatingSystems = {};
    visitors.forEach((v) => {
        devices[v.deviceType] = (devices[v.deviceType] || 0) + 1;
        browsers[v.browser] = (browsers[v.browser] || 0) + 1;
        countries[v.country || 'Unknown'] = (countries[v.country || 'Unknown'] || 0) + 1;
        operatingSystems[v.os] = (operatingSystems[v.os] || 0) + 1;
    });
    // Get recent 20 visitor logs
    const recentVisitors = yield prisma_1.default.visitor.findMany({
        orderBy: {
            lastVisit: 'desc',
        },
        take: 20,
    });
    return {
        totalVisitors,
        totalVisits,
        deviceDistribution: devices,
        browserDistribution: browsers,
        countryDistribution: countries,
        osDistribution: operatingSystems,
        recentVisitors,
    };
});
exports.AnalyticsService = {
    trackVisit,
    getStats,
};
