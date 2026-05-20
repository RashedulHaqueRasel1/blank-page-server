import prisma from '../../lib/prisma';
import { parseUA } from '../../utils/uaParser';
import { Visitor } from '../../generated/client';
import config from '../../config';

const fetchGeoLocation = async (ip: string, visitorId: string) => {
  try {
    // Check if local IP
    if (
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('::ffff:127.0.0.1')
    ) {
      await prisma.visitor.update({
        where: { id: visitorId },
        data: {
          country: 'Localhost',
          city: 'Localhost',
        },
      });
      return;
    }

    const response = await fetch(`${config.ip_geolocation_api_url}${ip}`);
    const data = await response.json();

    if (data && data.status === 'success') {
      await prisma.visitor.update({
        where: { id: visitorId },
        data: {
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
        },
      });
    }
  } catch (error) {
    console.error('Failed to fetch geolocation for IP:', ip, error);
  }
};

const trackVisit = async (
  ip: string,
  userAgent: string,
  referrer?: string
): Promise<Visitor> => {
  // Normalize IP
  const normalizedIp = ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip;

  const existingVisitor = await prisma.visitor.findUnique({
    where: {
      ip_userAgent: {
        ip: normalizedIp,
        userAgent,
      },
    },
  });

  if (existingVisitor) {
    const updated = await prisma.visitor.update({
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
  const { deviceType, browser, os } = parseUA(userAgent);

  const newVisitor = await prisma.visitor.create({
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
};

const getStats = async () => {
  const [totalVisitors, visitors] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.findMany({
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
  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const countries: Record<string, number> = {};
  const operatingSystems: Record<string, number> = {};

  visitors.forEach((v) => {
    devices[v.deviceType] = (devices[v.deviceType] || 0) + 1;
    browsers[v.browser] = (browsers[v.browser] || 0) + 1;
    countries[v.country || 'Unknown'] = (countries[v.country || 'Unknown'] || 0) + 1;
    operatingSystems[v.os] = (operatingSystems[v.os] || 0) + 1;
  });

  return {
    totalVisitors,
    totalVisits,
    deviceDistribution: devices,
    browserDistribution: browsers,
    countryDistribution: countries,
    osDistribution: operatingSystems,
  };
};

export const AnalyticsService = {
  trackVisit,
  getStats,
};
