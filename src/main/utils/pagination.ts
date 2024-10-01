import { v4 as uuidv4 } from 'uuid';
export const getPagination = (page?: number, pageSize?: number) => {
  if (page == null || pageSize == null) {
    return { skip: undefined, take: undefined }; // Return undefined to fetch all data
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { skip, take };
};

export const firstPartUid = () => {
 const rawUid = uuidv4();
  // ใช้ split() เพื่อแยก UUID ตามเครื่องหมาย '-'
  const parts = rawUid.split('-');

  // ดึงแค่ชุดแรก
  const  uid : string = parts[0];
  return uid
};
