import { z } from 'zod';

export const accountIdFieldSchema = z
  .string()
  .min(6)
  .max(100)
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => val.length >= 6, { message: 'accountId phải từ 6 đến 100 ký tự' });

export const accountIdObjSchema = z.object({
  accountId: accountIdFieldSchema,
});
