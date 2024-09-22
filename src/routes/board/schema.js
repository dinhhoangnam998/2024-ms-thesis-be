import { z } from 'zod';

export const voteForEnum = z.enum(['Owner', 'CA']);

export const voteCaSchema = z.object({
  caOid: z.string(),
  boardMemberAddress: z.string(),
  boardAccountId: z.string(),
  txid: z.string(),
  votedAt: z.number(),
});

export const voteReportSchema = z.object({
  reportOid: z.string(),
  boardMemberAddress: z.string(),
  voteFor: voteForEnum,
  voteAt: z.number(),
  txid: z.string(),
});