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

  const [items, total] = await Promise.all([
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

  
  ]);

  return {
    items,
    total,
    page: page || 1,
    pageSize: pageSize || total,

  };
}
