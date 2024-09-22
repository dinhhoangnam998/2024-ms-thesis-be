import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { genReadMany, MiddlewareMode } from '#src/libs/base-crud/index.js';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authen } from '../access-control/middleware.js';
import { voteCaSchema, voteReportSchema } from './schema.js';

const router = Router();

router.get(
  '/cas',
  (req, res, next) => {
    req.beQuery = { roles: 'CA' };
    next();
  },
  genReadMany({ collName: Collections.Accounts, mode: MiddlewareMode.DIRECT_RESPONSE })
);

router.patch(
  '/cas/vote',
  handlerWrapper(async (req, res) => {
    const { caOid, ...rest } = voteCaSchema.parse(req.body);
    await db.collection(Collections.Accounts).updateOne({ _id: new ObjectId(caOid) }, { $push: { votes: rest } });
    return res.sendStatus(201);
  })
);

router.get('/reports', genReadMany({ collName: Collections.FraudReports, mode: MiddlewareMode.DIRECT_RESPONSE }));

router.patch(
  '/reports/vote',
  authen,
  handlerWrapper(async (req, res) => {
    const payload = voteReportSchema.parse(req.body);
    await db
      .collection(Collections.Certificates)
      .updateOne(
        { _id: new ObjectId(payload.reportOid) },
        { $push: { [payload.voteFor == 'Owner' ? 'reporterVotes' : 'caVotes']: payload } }
      );
    return res.sendStatus(201);
  })
);
export default router;
