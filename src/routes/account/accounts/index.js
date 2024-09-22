import { getAccountByAccountId } from '#src/core/repo/account.js';
import { accountIdObjSchema } from '#src/core/schema.js';
import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { MiddlewareMode, genReadMany } from '#src/libs/base-crud/index.js';
import { Role } from '#src/routes/access-control/role.js';
import { Router } from 'express';
import { author } from '../../access-control/middleware.js';
import { filterOutUserAccountSensitiveInfo } from '../helper.js';

const router = Router();

router.delete(
  '/',
  author([]),
  handlerWrapper(async (req, res) => {
    const { accountId } = accountIdObjSchema.parse(req.query);
    const result = await db.collection(Collections.Accounts).deleteOne({ accountId });
    return res.json(result);
  })
);

router.get(
  '/:accountId',
  handlerWrapper(async (req, res) => {
    const { accountId } = accountIdObjSchema.parse(req.params);
    const account = await getAccountByAccountId(accountId);
    return res.json(account);
  })
);

router.get(
  '/',
  author([Role.Account_Reader]),
  genReadMany({ collName: Collections.Accounts, mode: MiddlewareMode.PASS_NEXT }),
  handlerWrapper(async (req, res) => {
    const newDocs = filterOutUserAccountSensitiveInfo(req.caller, res.result);
    return res.json({ ...res.result, docs: newDocs });
  })
);

export default router;
