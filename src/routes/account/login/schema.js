import { accountIdFieldSchema } from '#src/core/schema.js';
import { RoleEnum } from '#src/routes/access-control/role.js';
import { z } from 'zod';

export const loginSchema = z.object({
  accountId: accountIdFieldSchema,
  password: z.string(),
});

export const signupSchema = z.object({
  accountId: accountIdFieldSchema,
  password: z.string(),
  roles: RoleEnum.array().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
