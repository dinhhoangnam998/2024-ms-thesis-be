import 'dotenv/config';
import { FileStorageProviderEnum } from '#src/constant/index.js';
import { z } from 'zod';
import { accountIdFieldSchema } from '#src/core/schema.js';

const booleanParamSchema = z.enum(['true', 'false']).transform((value) => value === 'true');

const appEnvSchema = z.object({
  MONGODB_CONNECT_STRING: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().int().default(8000),
  REQUEST_SIZE_LIMIT_IN_MB: z.coerce.number().int(),
  PAGINATION_MAX_PAGE_SIZE: z.coerce.number().int(),
  // log lib
  APP_NAME: z.string(),
  TIME_ZONE: z.string(),

  // file storage
  // FILE_STORAGE_PROVIDER: FileStorageProviderEnum,
  // FILE_SERVER_URL: z.string().optional(),
  // FILE_SEVER_ACCESS_TOKEN: z.string().optional(),
  // GCS_BUCKET_NAME: z.string().optional(),
  // GCS_SIGNED_URL_EXPIRE_TIME_IN_MINUTES: z.string().optional(),
  // GCS_SA_KEY_FILE_PATH: z.string().optional(),
  // send mail
  GG_MAILER_USER: z.string().email(),
  GG_MAILER_PW: z.string(),

  ACCESS_TOKEN_EXPIRE_TIME: z.string().or(z.number()).default('10m'),
});
// .superRefine((schema, ctx) => {
//   if (schema.FILE_STORAGE_PROVIDER === FileStorageProviderEnum.enum.BSIGN_FILE_SERVER) {
//     if (!schema.FILE_SERVER_URL || !schema.FILE_SEVER_ACCESS_TOKEN) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message:
//           'FILE_SERVER_URL and FILE_SEVER_ACCESS_TOKEN are required if FILE_STORAGE_PROVIDER is BSIGN_FILE_SERVER',
//       });
//     }
//   }

//   if (schema.FILE_STORAGE_PROVIDER === FileStorageProviderEnum.enum.GG_CLOUD_STORAGE) {
//     if (!schema.GCS_BUCKET_NAME || !schema.GCS_SIGNED_URL_EXPIRE_TIME_IN_MINUTES || !schema.GCS_SA_KEY_FILE_PATH) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message:
//           'GCS_BUCKET_NAME, GCS_SIGNED_URL_EXPIRE_TIME_IN_MINUTES, GCS_SA_KEY_FILE_PATH are required if FILE_STORAGE_PROVIDER is GG_CLOUD_STORAGE',
//       });
//     }
//   }
// });

export const appEnv = appEnvSchema.parse(process.env);
