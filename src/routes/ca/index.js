import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { genReadMany, MiddlewareMode } from '#src/libs/base-crud/index.js';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authen } from '../access-control/middleware.js';
import { Role } from '../access-control/role.js';
import { csrSignatureSchema, pleadAReportSchema } from './schema.js';

const router = Router();

router.get(
  '/ca-options',
  handlerWrapper(async (req, res) => {
    const docs = await db.collection(Collections.Accounts).find({ roles: Role.CA }).toArray();
    return res.json({ cas: docs });
  })
);

router.get(
  '/csrs',
  authen,
  (req, res, next) => {
    req.beQuery = { caAccountIds: req.caller.accountId };
    next();
  },
  genReadMany({ collName: Collections.Certificates, mode: MiddlewareMode.DIRECT_RESPONSE })
);

router.post(
  '/csr-signature',
  authen,
  handlerWrapper(async (req, res) => {
    const { csrId, signature } = csrSignatureSchema.parse(req.body);
    await db
      .collection(Collections.Certificates)
      .updateOne(
        { _id: new ObjectId(csrId), 'signatures.caAccountId': req.caller.accountId },
        { $set: { 'signatures.$.signature': signature } }
      );

    return res.sendStatus(201);
  })
);

// update ca info after asking to join the trusted list
router.patch(
  '/info',
  authen,
  handlerWrapper(async (req, res) => {
    // const { name, caAddress, docsCid, txid, id, stakeAmount } = updateCaAddressSchema.parse(req.body);
    await db.collection(Collections.Accounts).updateOne({ accountId: req.caller.accountId }, { $set: { ...req.body } });
    return res.sendStatus(201);
  })
);

router.get(
  '/reports',
  authen,
  (req, res, next) => {
    req.beQuery = { caAccountIds: req.caller.accountId };
    next();
  },
  genReadMany({ collName: Collections.FraudReports, mode: MiddlewareMode.DIRECT_RESPONSE })
);

router.patch(
  '/reports',
  authen,
  handlerWrapper(async (req, res) => {
    const { reportOid, ipfsCid } = pleadAReportSchema.parse(req.body);
    await db
      .collection(Collections.Certificates)
      .updateOne(
        { _id: new ObjectId(reportOid) },
        { $push: { caPleadDocCIDs: { ipfsCid, caAccountId: req.caller.accountId } } }
      );
    return res.sendStatus(201);
  })
);

export default router;
