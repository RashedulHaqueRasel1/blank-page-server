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
exports.SubscriberService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const mailer_1 = require("../../utils/mailer");
const config_1 = __importDefault(require("../../config"));
const fetchGeoLocation = (ip, subscriberId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ip === '::1' ||
            ip === '127.0.0.1' ||
            ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('::ffff:127.0.0.1')) {
            yield prisma_1.default.subscriber.update({
                where: { id: subscriberId },
                data: { country: 'Localhost', city: 'Localhost' },
            });
            return;
        }
        const response = yield fetch(`${config_1.default.ip_geolocation_api_url}${ip}`);
        const data = yield response.json();
        if (data && data.status === 'success') {
            yield prisma_1.default.subscriber.update({
                where: { id: subscriberId },
                data: {
                    country: data.country || 'Unknown',
                    city: data.city || 'Unknown',
                },
            });
        }
    }
    catch (_a) {
        // Fail silently
    }
});
const subscribe = (email, ip, userAgent) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if already subscribed
    const existing = yield prisma_1.default.subscriber.findUnique({ where: { email } });
    if (existing) {
        return { alreadySubscribed: true, subscriber: existing };
    }
    // Check if email belongs to a registered user
    const registeredUser = yield prisma_1.default.user.findUnique({ where: { email } });
    const normalizedIp = ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip;
    // Subscription end date: 2030-12-31
    const subscriptionEndDate = new Date('2030-12-31T23:59:59.000Z');
    const subscriber = yield prisma_1.default.subscriber.create({
        data: {
            email,
            isSubscribed: true,
            isRegisteredUser: !!registeredUser,
            ip: normalizedIp,
            userAgent,
            country: 'Fetching...',
            city: 'Fetching...',
            subscriptionStartDate: new Date(),
            subscriptionEndDate,
        },
    });
    // Fetch geo in background
    fetchGeoLocation(normalizedIp, subscriber.id);
    // Send thank you email in background
    (0, mailer_1.sendThankYouEmail)(email).catch((err) => {
        console.error('Failed to send thank you email:', err);
    });
    return { alreadySubscribed: false, subscriber };
});
const getSubscribers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [subscribers, total] = yield Promise.all([
        prisma_1.default.subscriber.findMany({
            orderBy: { subscriptionStartDate: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.default.subscriber.count(),
    ]);
    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: subscribers,
    };
});
const updateSubscriber = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updateData = Object.assign({}, data);
    if (data.isSubscribed !== undefined) {
        updateData.unsubscribedAt = data.isSubscribed ? null : new Date();
    }
    return prisma_1.default.subscriber.update({
        where: { id },
        data: updateData,
    });
});
const deleteSubscriber = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.subscriber.delete({ where: { id } });
});
const unsubscribe = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.subscriber.update({
        where: { email },
        data: {
            isSubscribed: false,
            unsubscribedAt: new Date()
        },
    });
});
exports.SubscriberService = {
    subscribe,
    getSubscribers,
    updateSubscriber,
    deleteSubscriber,
    unsubscribe,
};
