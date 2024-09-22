import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { genReadMany, MiddlewareMode } from '#src/libs/base-crud/index.js';
import { Router } from 'express';
import { createCertificateSchema } from './schema.js';
import { ObjectId } from 'mongodb';
import { authen } from '../access-control/middleware.js';

const router = Router();

// router.get('/certificates', genReadMany({ collName: Collections.Certificates, mode: MiddlewareMode.DIRECT_RESPONSE }));

router.get(
  '/certificates/:certId',
  handlerWrapper(async (req, res) => {
    const cert = await db.collection(Collections.Certificates).findOne({ _id: new ObjectId(req.params.certId) });
    return res.json(cert);
  })
);

router.get(
  '/certificates',
  authen,
  (req, res, next) => {
    req.beQuery = { identity: req.caller.accountId };
    next();
  },
  genReadMany({ collName: Collections.Certificates, mode: MiddlewareMode.DIRECT_RESPONSE })
);

router.post(
  '/certificates',
  handlerWrapper(async (req, res) => {
    const payload = createCertificateSchema.parse(req.body);
    const promises = payload.caAccountIds.map(async (caAccId) => {
      const caAccount = await db.collection(Collections.Accounts).findOne({ accountId: caAccId });
      return caAccount;
    });
    const cas = await Promise.all(promises);
    const signatures = cas.map((item) => ({ caAccountId: item.accountId, caAddress: item.caAddress }));
    await db
      .collection(Collections.Certificates)
      .insertOne({ ...payload, onBlockchain: false, signatures: signatures, createdAt: Date.now() });
    return res.sendStatus(201);
  })
);

router.patch(
  '/certificates/:certId',
  handlerWrapper(async (req, res) => {
    await db
      .collection(Collections.Certificates)
      .updateOne({ _id: new ObjectId(req.params.certId) }, { $set: { ...req.body } });
    return res.sendStatus(201);
  })
);

export default router;
