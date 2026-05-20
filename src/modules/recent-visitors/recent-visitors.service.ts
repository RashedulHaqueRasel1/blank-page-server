import prisma from '../../lib/prisma';

const getRecentVisitors = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      orderBy: { lastVisit: 'desc' },
      skip,
      take: limit,
    }),
    prisma.visitor.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: visitors,
  };
};

const getVisitorById = async (id: string) => {
  return prisma.visitor.findUnique({ where: { id } });
};

const deleteVisitor = async (id: string) => {
  return prisma.visitor.delete({ where: { id } });
};

export const RecentVisitorsService = {
  getRecentVisitors,
  getVisitorById,
  deleteVisitor,
};
