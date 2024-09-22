import { appEnv } from '#src/config/env.js';
import { getAccountByAccountId } from '#src/core/repo/account.js';
import { handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { genAccessTokenContent, genTokens } from '../helper.js';
import { loginSchema, refreshTokenSchema, signupSchema } from './schema.js';

const router = Router();

router.post(
  '/login',
  handlerWrapper(async (req, res) => {
    const { accountId, password } = loginSchema.parse(req.body);
    const account = await getAccountByAccountId(accountId);
    if (!bcrypt.compareSync(password, account.hashedPassword))
      return res.status(400).json({ message: 'Mật khẩu không chính xác!' });
    const { accessToken, refreshToken } = await genTokens({ account });
    return res.json({
      accountId,
      roles: account.roles,
      accessToken,
      refreshToken,
    });
  })
);

router.post(
  '/sign-up',
  handlerWrapper(async (req, res) => {
    const { accountId, password, roles } = signupSchema.parse(req.body);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const account = { accountId, hashedPassword, roles };
    await db.collection(Collections.Accounts).insertOne(account);

    const { accessToken, refreshToken } = await genTokens({ account });
    return res.json({
      accountId,
      roles: account.roles,
      accessToken,
      refreshToken,
    });
  })
);

router.post(
  '/access-token',
  handlerWrapper(async (req, res) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, appEnv.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'RefreshTokenError: refreshToken đã hết hạn!' });
      } else throw error;
    }
    const doc = await db.collection(Collections.RefreshTokens).findOne({ _id: new ObjectId(decoded.id) });
    if (!doc) return res.status(403).json({ message: 'RefreshTokenError: refreshToken không còn tồn tại!' });
    if (!bcrypt.compareSync(decoded.refreshTokenSecret, doc.hashedRefreshTokenSecret))
      return res.status(400).json({ message: 'RefreshTokenError: refreshTokenSecret không hợp lệ!' });
    const acc = await getAccountByAccountId(decoded.accountId);
    const accessTokenContent = genAccessTokenContent(acc);
    const accessToken = jwt.sign(accessTokenContent, appEnv.JWT_SECRET, {
      expiresIn: appEnv.ACCESS_TOKEN_EXPIRE_TIME,
    });
    return res.json({ accessToken });
  })
);

export default router;
