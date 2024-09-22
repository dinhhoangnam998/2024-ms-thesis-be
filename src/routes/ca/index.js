import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { Router } from 'express';
import { Role } from '../access-control/role.js';
import { genReadMany, MiddlewareMode } from '#src/libs/base-crud/index.js';
import { authen } from '../access-control/middleware.js';
import { csrSignatureSchema, updateCaAddressSchema } from './schema.js';
import { ObjectId } from 'mongodb';

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

router.patch(
  '/ca-address',
  authen,
  handlerWrapper(async (req, res) => {
    // const { name, caAddress, docsCid, txid, id, stakeAmount } = updateCaAddressSchema.parse(req.body);
    await db.collection(Collections.Accounts).updateOne({ accountId: req.caller.accountId }, { $set: { ...req.body } });
    return res.sendStatus(201);
  })
);

export default router;
