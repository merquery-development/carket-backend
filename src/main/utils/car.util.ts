import { getPagination } from './pagination';
export async function getCarsAndStats({
  prismaModel,
  page,
  pageSize,
  brandId,
  categoryId,
  priceMin,
  priceMax,
  modelName,
  vendorName,
  vendorId, // เพิ่ม vendorId
  sortBy,
  sortOrder,
  customSelect,
  fieldMapping,
}: {
  prismaModel: any;
  page?: number | null;
  pageSize?: number | null;
  brandId?: number[];
  categoryId?: number[];
  priceMin?: number | null;
  priceMax?: number | null;
  modelName?: string;
  vendorName?: string;
  vendorId?: number | null; // เพิ่ม vendorId
  sortBy?: string;
  sortOrder?: string;
  customSelect?: object;
  fieldMapping?: object;
}) {
  const { skip, take } = getPagination(page, pageSize);

  // เงื่อนไขการกรอง
  const where = {
    ...(brandId?.length > 0
      ? {
          car: {
            Brand: {
              id: { in: brandId },
            },
          },
        }
      : {}),
    ...(categoryId?.length > 0
      ? {
          car: {
            Category: {
              id: { in: categoryId },
            },
          },
        }
      : {}),
    ...(priceMin !== null && priceMax !== null
      ? { price: { gte: priceMin, lte: priceMax } }
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
    ...(vendorId
      ? {
          vendorId: vendorId, // กรองตาม vendorId
        }
      : {}),
  };

  // เงื่อนไขสำหรับ vendorName
  const vendorWhere = vendorName
    ? {
        vendor: {
          name: { contains: vendorName, mode: 'insensitive' },
        },
      }
    : {};

  // รวมเงื่อนไขการกรองทั้งหมด
  const finalWhere = { ...where, ...vendorWhere };

  // ดึงข้อมูลจาก Prisma
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
    prismaModel.count({
      where: finalWhere, // ใช้เงื่อนไขเดียวกันสำหรับ count
    }),
  ]);

  return {
    items,
    total,
    page: page || 1,
    pageSize: pageSize || total,
  };
}
