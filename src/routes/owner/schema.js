import { z } from 'zod';

export const createCertificateSchema = z.object({
  identity: z.string(),
  serialNumber: z.string(),
  publicKey: z.string(),
  validFrom: z.string(),
  validTo: z.string(),
  caAccountIds: z.string().array(),
  organization: z.string().optional(),
  unit: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  locality: z.string().optional(),
});

export const createFraudReportSchema = z.object({
  // reportId: z.string(),
  reporter: z.string(),
  stakeAmount: z.string(),
  identity: z.string(),
  serialNumber: z.string(),
  caAddresses: z.string().array(),
  caAccountIds: z.string().array(),
  reportDocCID: z.string(),
  txid: z.string(),
});