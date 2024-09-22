import { z } from 'zod';

export const voteCaSchema = z.object({
  caId: z.string(),
  boardAddress: z.string(),
  boardAccountId: z.string(),
  txid: z.string(),
  votedAt: z.number(),
});
