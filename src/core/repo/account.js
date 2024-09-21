import { Collections, db } from '#src/db.js';
import { ResourceNotFound } from '#src/qa/errors.js';

export async function getAccountByAccountId(accountId) {
  const coll = db.collection(Collections.Accounts);
  const acc = await coll.findOne({ accountId });
  if (!acc) throw new ResourceNotFound({ message: `AccountId ${accountId} không tồn tại!` });
  return acc;
}
