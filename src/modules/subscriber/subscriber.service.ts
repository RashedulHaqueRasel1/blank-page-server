import prisma from '../../lib/prisma';
import { sendVerificationEmail } from '../../utils/mailer';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import crypto from 'crypto';

const fetchGeoLocation = async (ip: string, subscriberId: string) => {
  try {
    if (
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('::ffff:127.0.0.1')
    ) {
      await prisma.subscriber.update({
        where: { id: subscriberId },
        data: { country: 'Localhost', city: 'Localhost' },
      });
      return;
    }

    const response = await fetch(`${config.ip_geolocation_api_url}${ip}`);
    const data = await response.json();

    if (data && data.status === 'success') {
      await prisma.subscriber.update({
        where: { id: subscriberId },
        data: {
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
        },
      });
    }
  } catch {
    // Fail silently
  }
};

const subscribe = async (email: string, ip: string, userAgent: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Check if email belongs to a registered user
  const registeredUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  const normalizedIp = ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip;

  // Subscription end date: 2030-12-31
  const subscriptionEndDate = new Date('2030-12-31T23:59:59.000Z');

  const existing = await prisma.subscriber.findUnique({ where: { email: normalizedEmail } });

  const subscriber = existing
    ? await prisma.subscriber.update({
        where: { email: normalizedEmail },
        data: {
          isSubscribed: true,
          isRegisteredUser: !!registeredUser,
          verificationCode,
          verificationExpiresAt,
          ip: normalizedIp,
          userAgent,
          subscriptionEndDate,
          unsubscribedAt: null,
        },
      })
    : await prisma.subscriber.create({
      data: {
      email: normalizedEmail,
      isSubscribed: true,
      isRegisteredUser: !!registeredUser,
      verificationCode,
      verificationExpiresAt,
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

  const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode);

  return { alreadySubscribed: !!existing, subscriber, devVerificationCode: emailResult.devCode };
};

const verifySubscriberEmail = async (email: string, code: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const subscriber = await prisma.subscriber.findUnique({ where: { email: normalizedEmail } });

  if (!subscriber) {
    throw new ApiError(404, 'Subscriber not found');
  }

  if (subscriber.isVerified) {
    if (subscriber.backupToken) {
      return subscriber;
    }

    return prisma.subscriber.update({
      where: { email: normalizedEmail },
      data: { backupToken: crypto.randomBytes(32).toString('hex') },
    });
  }

  if (!subscriber.verificationCode || !subscriber.verificationExpiresAt) {
    throw new ApiError(400, 'No verification code found. Please request a new code.');
  }

  if (subscriber.verificationExpiresAt < new Date()) {
    throw new ApiError(400, 'Verification code expired. Please request a new code.');
  }

  if (subscriber.verificationCode !== code.trim()) {
    throw new ApiError(400, 'Invalid verification code');
  }

  const verifiedSubscriber = await prisma.subscriber.update({
    where: { email: normalizedEmail },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
      verificationCode: null,
      verificationExpiresAt: null,
      backupToken: crypto.randomBytes(32).toString('hex'),
    },
  });

  return verifiedSubscriber;
};

const getOrCreateBackupToken = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const subscriber = await prisma.subscriber.findUnique({ where: { email: normalizedEmail } });

  if (!subscriber) {
    throw new ApiError(404, 'Subscriber not found');
  }

  if (!subscriber.isVerified) {
    throw new ApiError(403, 'Email must be verified before backup can be enabled');
  }

  if (subscriber.backupToken) {
    return subscriber;
  }

  return prisma.subscriber.update({
    where: { email: normalizedEmail },
    data: { backupToken: crypto.randomBytes(32).toString('hex') },
  });
};

const getSubscribers = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { subscriptionStartDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.subscriber.count(),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: subscribers,
  };
};

const updateSubscriber = async (
  id: string,
  data: { isSubscribed?: boolean; isVerified?: boolean; subscriptionEndDate?: Date }
) => {
  const updateData: any = { ...data };
  
  if (data.isSubscribed !== undefined) {
    updateData.unsubscribedAt = data.isSubscribed ? null : new Date();
  }

  return prisma.subscriber.update({
    where: { id },
    data: updateData,
  });
};

const deleteSubscriber = async (id: string) => {
  return prisma.subscriber.delete({ where: { id } });
};

const unsubscribe = async (email: string) => {
  return prisma.subscriber.update({
    where: { email },
    data: { 
      isSubscribed: false,
      unsubscribedAt: new Date()
    },
  });
};

export const SubscriberService = {
  subscribe,
  verifySubscriberEmail,
  getOrCreateBackupToken,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  unsubscribe,
};
