import { Collections, db } from '#src/db.js';
import { hasRoleAdmin } from '#src/routes/access-control/role.js';
import generator from 'generate-password';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { appEnv } from '#src/config/env.js';

export function isEmptyPassword(password) {
  if (password === null || password === undefined || password.trim() === '') return true;
}

export function genRandomPassword() {
  return generator.generate({
    numbers: true,
    excludeSimilarCharacters: true,
  });
}

export function filterOutUserAccountSensitiveInfo(caller, result) {
  const newDocs = result.docs.map((doc) => {
    delete doc.hashedPassword;
    if (!hasRoleAdmin(caller.roles)) delete doc.initialPassword;
    return doc;
  });
  return newDocs;
}

export function genAccessTokenContent(account) {
  return { accountId: account.accountId, roles: account.roles, info: { name: account?.info?.name || '' } };
}

export async function genTokens({
  account,
  accessTokenExpireTime = appEnv.ACCESS_TOKEN_EXPIRE_TIME,
  refreshTokenExpireTime = null,
}) {
  const accountId = account.accountId;
  const accessTokenContent = genAccessTokenContent(account);
  const accessToken = jwt.sign(accessTokenContent, appEnv.JWT_SECRET, { expiresIn: accessTokenExpireTime });
  const refreshTokenSecret = uuidv4();
  const salt = await bcrypt.genSalt();
  const hashedRefreshTokenSecret = await bcrypt.hash(refreshTokenSecret, salt);
  const opResponse = await db
    .collection(Collections.RefreshTokens)
    .insertOne({ accountId, timestamp: Date.now(), hashedRefreshTokenSecret });
  const id = opResponse.insertedId;
  const refreshTokenContent = { id, accountId, refreshTokenSecret };
  const refreshToken = refreshTokenExpireTime
    ? jwt.sign(refreshTokenContent, appEnv.JWT_SECRET, { expiresIn: refreshTokenExpireTime })
    : jwt.sign(refreshTokenContent, appEnv.JWT_SECRET);
  return { accessToken, refreshToken };
}

export async function clearRefreshTokens(accountId) {
  return db.collection(Collections.RefreshTokens).deleteMany({ accountId });
}
