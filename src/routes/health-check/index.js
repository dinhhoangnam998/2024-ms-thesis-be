import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { Router } from 'express';

const router = Router();

router.get(
  '/health-check',
  handlerWrapper(async (req, res) => {
    await db.collection(Collections.Accounts).findOne({});
    return res.sendStatus(200);
  })
);

export default router;
