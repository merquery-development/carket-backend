import { getPagination } from './pagination';

export async function getCarsAndStats({
  prismaModel,
  page = null,
  pageSize = null,
  brandId = null,
  categoryId = null,
  priceMin = null,
  priceMax = null,
  modelName = null, // New filter
  vendorName = null, // New filter
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

  // กำหนดเงื่อนไขกรองทั่วไป
  const where = {
    ...(brandId ? { [fieldMapping.brandIdField]: { equals: brandId } } : {}),
    ...(categoryId
      ? { [fieldMapping.categoryIdField]: { equals: categoryId } }
      : {}),
    ...(priceMin !== null && priceMax !== null
      ? { [fieldMapping.priceField]: { gte: priceMin, lte: priceMax } }
      : {}),
    ...(modelName
      ? {
          car: {
            Model: {
              name: { contains: modelName, mode: 'insensitive' },
            },
          },
        }
      : {}),
  };

  // กรอง vendorName โดยตรงใน CarPost
  const vendorWhere = vendorName
    ? {
        vendor: {
          name: { contains: vendorName, mode: 'insensitive' },
        },
      }
    : {};

  // รวมเงื่อนไขการกรองทั้งหมด
  const finalWhere = { ...where, ...vendorWhere };

  // ค้นหาข้อมูลและคำนวณจำนวน
  const [items, total] = await Promise.all([
    prismaModel.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: customSelect,
    }),
    prismaModel.count({ where: finalWhere }),
  ]);

  return {
    items,
    total,
    page: page || 1,
    pageSize: pageSize || total,
  };
}
