import { z } from 'zod';
import { RoleEnum } from '../../access-control/role.js';
import { accountIdFieldSchema } from '#src/core/schema.js';

// TODO: in future version: consider to keep only personal info fields,
// remove cert's names fields
const infoSchema = z.object({
  name: z.string().min(6).max(100),
  organization: z.string().optional(),
  unit: z.string().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  locality: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  // other info here
});

export const createAccountSchema = z.object({
  accountId: accountIdFieldSchema,
  password: z.string().optional(),
  roles: RoleEnum.array().min(1),
  info: infoSchema,
  issueCertAlso: z.boolean().default(false),
});

export const updateAccInfoSchema = z.object({
  info: infoSchema.partial(),
});

export const updateRoleSchema = z.object({
  accountId: accountIdFieldSchema,
  roles: RoleEnum.array().min(1),
});

export const importAccountsSchema = createAccountSchema.array();
