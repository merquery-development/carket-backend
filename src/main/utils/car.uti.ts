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
  mileageMin = null,
  mileageMax = null,
  sortBy = 'createdAt',
  sortOrder = 'asc',
  customSelect = {},
  fieldMapping = {
    priceField: 'basePrice', // Default to Car's basePrice
    mileageField: 'mileage',
    brandIdField: 'brandId',
    categoryIdField: 'categoryId',
  },
}) {
  const { skip, take } = getPagination(page, pageSize);

  // Dynamically apply field mappings
  const where = {
    ...(brandId ? { [fieldMapping.brandIdField]: { equals: brandId } } : {}),
    ...(categoryId
      ? { [fieldMapping.categoryIdField]: { equals: categoryId } }
      : {}),
    ...(priceMin !== null && priceMax !== null
      ? { [fieldMapping.priceField]: { gte: priceMin, lte: priceMax } }
      : {}),
    ...(mileageMin !== null && mileageMax !== null
      ? { [fieldMapping.mileageField]: { gte: mileageMin, lte: mileageMax } }
      : {}),
  };

  const [items, total, mileageStats, priceStats] = await Promise.all([
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
      by: [fieldMapping.mileageField],
      _count: true,
      where,
      having: {
        [fieldMapping.mileageField]: {
          gte: mileageMin ?? 0,
          lte: mileageMax ?? 1000000,
        },
      },
    }),

    prismaModel.groupBy({
      by: [fieldMapping.priceField], // Dynamically use price/basePrice
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
    mileageStats: mileageStats.map((stat) => ({
      mileage: stat[fieldMapping.mileageField],
      count: stat._count,
    })),
    priceStats: priceStats.map((stat) => ({
      price: stat[fieldMapping.priceField], // Dynamically use price/basePrice
      count: stat._count,
    })),
  };
}
