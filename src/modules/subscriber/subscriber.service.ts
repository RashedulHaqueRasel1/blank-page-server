import prisma from '../../lib/prisma';
import { sendThankYouEmail } from '../../utils/mailer';
import config from '../../config';

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
  // Check if already subscribed
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return { alreadySubscribed: true, subscriber: existing };
  }

  // Check if email belongs to a registered user
  const registeredUser = await prisma.user.findUnique({ where: { email } });

  const normalizedIp = ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip;

  // Subscription end date: 2030-12-31
  const subscriptionEndDate = new Date('2030-12-31T23:59:59.000Z');

  const subscriber = await prisma.subscriber.create({
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
  sendThankYouEmail(email).catch((err) => {
    console.error('Failed to send thank you email:', err);
  });

  return { alreadySubscribed: false, subscriber };
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
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  unsubscribe,
};

