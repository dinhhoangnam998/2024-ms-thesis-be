import { Router } from 'express';
import loginRouter from './login/login-apis.js';

const router = Router();
router.use(loginRouter);
// router.use('/accounts', authen, accountRouter);

export default router;
