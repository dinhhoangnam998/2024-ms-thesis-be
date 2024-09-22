import { z } from 'zod';

export const csrSignatureSchema = z.object({
  csrId: z.string(),
  signature: z.string(),
});

export const updateCaAddressSchema = z.object({
  id: z.string(),
  name: z.string(),
  caAddress: z.string(),
  stakeAmount: z.string(),
  docsCid: z.string(),
  txid: z.string(),
});

export const pleadAReportSchema = z.object({
  reportOid: z.string(),
  ipfsCid: z.string(),
});