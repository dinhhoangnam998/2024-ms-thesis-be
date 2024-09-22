import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { genReadMany, MiddlewareMode } from '#src/libs/base-crud/index.js';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authen } from '../access-control/middleware.js';
import { createCertificateSchema, createFraudReportSchema } from './schema.js';

const router = Router();

router.get(
  '/certificates/:certOid',
  handlerWrapper(async (req, res) => {
    const cert = await db.collection(Collections.Certificates).findOne({ _id: new ObjectId(req.params.certOid) });
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
  '/certificates/:certOid',
  handlerWrapper(async (req, res) => {
    await db
      .collection(Collections.Certificates)
      .updateOne({ _id: new ObjectId(req.params.certOid) }, { $set: { ...req.body } });
    return res.sendStatus(201);
  })
);

router.get(
  '/reports/:reportOid',
  handlerWrapper(async (req, res) => {
    const report = await db.collection(Collections.FraudReports).findOne({ _id: new ObjectId(req.params.reportOid) });
    return res.json(report);
  })
);

router.get(
  '/reports',
  authen,
  (req, res, next) => {
    req.beQuery = { reporterAccountId: req.caller.accountId };
    next();
  },
  genReadMany({ collName: Collections.FraudReports, mode: MiddlewareMode.DIRECT_RESPONSE })
);

router.post(
  '/reports',
  authen,
  handlerWrapper(async (req, res) => {
    const payload = createFraudReportSchema.parse(req.body);
    await db.collection(Collections.FraudReports).insertOne({
      ...payload,
      reporterAccountId: req.caller.accountId,
      createdAt: Date.now(),
      caPleadDocCIDs: [],
      reporterVotes: [],
      caVotes: [],
    });
    return res.sendStatus(201);
  })
);


export default router;
