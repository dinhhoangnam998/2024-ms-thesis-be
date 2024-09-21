import bcrypt from 'bcryptjs';
import { appEnv } from './config/env.js';
import { Collections, db } from './db.js';
import { Role } from './routes/access-control/role.js';

export async function onInit() {
  await initAdminAccount();
}

async function initAdminAccount() {
  const coll = db.collection(Collections.Accounts);
  const count = await coll.countDocuments({});
  if (count !== 0) return;

  const accountId = appEnv.ADMIN_ACCOUNT_ID;
  const password = appEnv.ADMIN_ACCOUNT_PASSWORD;
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  const adminAccount = {
    accountId,
    hashedPassword,
    roles: [Role.Admin],
    info: {
      name: appEnv.ADMIN_ACCOUNT_NAME,
    },
  };
  await coll.insertOne(adminAccount);
}
