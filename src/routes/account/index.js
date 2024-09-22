import { Router } from 'express';
import loginRouter from './login/login-apis.js';
import { authen } from '../access-control/middleware.js';
import accountRouter from './accounts/index.js';

const router = Router();
router.use(loginRouter);
router.use('/accounts', authen, accountRouter);

export default router;
