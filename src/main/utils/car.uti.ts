import { getPagination } from './pagination';

// car-utils.ts (Utility file)
export async function getCarsAndStats({
  prismaModel,
  page = null,
  pageSize = null,
  brandId = null,
  categoryId = null,
  priceMin = null,
  priceMax = null,
  sortBy = 'createdAt',
  sortOrder = 'asc',
  customSelect = {},
  fieldMapping = {
    priceField: 'basePrice',
    brandIdField: 'brandId',
    categoryIdField: 'categoryId',
  },
}) {
  const { skip, take } = getPagination(page, pageSize);

  const where = {
    ...(brandId ? { [fieldMapping.brandIdField]: { equals: brandId } } : {}),
    ...(categoryId ? { [fieldMapping.categoryIdField]: { equals: categoryId } } : {}),
    ...(priceMin !== null && priceMax !== null
      ? { [fieldMapping.priceField]: { gte: priceMin, lte: priceMax } }
      : {}),
  };

  const [items, total, priceStats] = await Promise.all([
    prismaModel.findMany({
      skip,
      take,
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: customSelect,
    }),

    prismaModel.count({ where }),

    prismaModel.groupBy({
      by: [fieldMapping.priceField],
      _count: true,
      where,
      having: {
        [fieldMapping.priceField]: {
          gte: priceMin ?? 0,
          lte: priceMax ?? 10000000,
        },
      },
    }),
  ]);

  return {
    items,
    total,
    page: page || 1,
    pageSize: pageSize || total,
    priceStats: priceStats.map((stat) => ({
      price: stat[fieldMapping.priceField],
      count: stat._count,
    })),
  };
}
