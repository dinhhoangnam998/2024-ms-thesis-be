import { accountIdObjSchema } from '#src/core/schema.js';
import { convertCertParamsLongToShort, handlerWrapper } from '#src/core/utils.js';
import { Collections, db } from '#src/db.js';
import { MiddlewareMode, genReadMany } from '#src/libs/base-crud/index.js';
import { Role, hasRoleAdmin } from '#src/routes/access-control/role.js';
import { createNewCert } from '#src/routes/credentials/p12/index.js';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { flatten } from 'mongo-dot-notation';
import { author } from '../../access-control/middleware.js';
import { filterOutUserAccountSensitiveInfo, genRandomPassword, isEmptyPassword } from '../helper.js';
import { createAccountSchema, importAccountsSchema, updateAccInfoSchema, updateRoleSchema } from './schema.js';
import { getAccountByAccountId } from '#src/core/repo/account.js';
import {
  assertCreateAccountPermission,
  assertReadAccountInfoPermission,
  assertUpdateAccountInfoPermission,
} from './permission.js';

const router = Router();

router.post(
  '/',
  author([Role.Account_Creator]),
  handlerWrapper(async (req, res) => {
    const payload = createAccountSchema.parse(req.body);
    const { password, issueCertAlso, ...rest } = payload;
    assertCreateAccountPermission({ callerRoles: req.caller.roles, creatingAccountRoles: payload.roles });
    const initialPassword = isEmptyPassword(password) ? genRandomPassword() : password;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(initialPassword, salt);
    const newAccount = { ...rest, hashedPassword, initialPassword, hasChangedPassword: false };
    // note: we created unique index on accountId field, so don't need to check duplicate here
    await db.collection(Collections.Accounts).insertOne(newAccount);
    if (issueCertAlso) {
      const { CN, C, ST, L, O, OU } = convertCertParamsLongToShort(payload.info);
      const requestPayload = { names: [{ C, ST, L, O, OU }], CN, key: { algo: 'rsa', size: 2048 } };
      try {
        await createNewCert({ requestPayload, accountId: payload.accountId, creator: req.caller });
      } catch (error) {
        return res
          .status(400)
          .json({ message: 'Tài khoản người dùng đã được tạo, nhưng xảy ra lỗi khi cấp chứng thư!' });
      }
    }
    return res.sendStatus(201);
  })
);

router.post(
  '/import-accounts',
  author([]),
  handlerWrapper(async (req, res) => {
    const records = importAccountsSchema.parse(req.body);
    // check if any accountId already exists!
    const coll = db.collection(Collections.Accounts);
    const docs = await coll.find({}, { projection: { accountId: 1 } }).toArray();
    const existingAccountIds = docs.map((item) => item.accountId);
    const toCreateAccountIds = records.map((item) => item.accountId);
    const intersection = toCreateAccountIds.filter((item) => existingAccountIds.includes(item));
    if (intersection.length > 0)
      return res.status(400).json({ message: `AccountId(s): ${intersection.join(', ')} đã tồn tại!` });

    // create batch accounts
    // TODO: try to improve this api performance
    const salt = await bcrypt.genSalt();
    const promises = records.map(async (record) => {
      const { password, ...rest } = record;
      const initialPassword = isEmptyPassword(password) ? genRandomPassword() : password;
      const hashedPassword = await bcrypt.hash(initialPassword, salt);
      return { ...rest, hashedPassword, initialPassword, hasChangedPassword: false };
    });
    const newAccounts = await Promise.all(promises);
    await db.collection(Collections.Accounts).insertMany(newAccounts);
    return res.sendStatus(201);
  })
);

// update account personal info
router.patch(
  '/',
  handlerWrapper(async (req, res) => {
    const { accountId } = accountIdObjSchema.parse(req.query);
    assertUpdateAccountInfoPermission({ caller: req.caller, accountId });
    const payload = updateAccInfoSchema.parse(req.body);
    const instruction = flatten(payload);
    const coll = db.collection(Collections.Accounts);
    await coll.updateOne({ accountId }, instruction);
    res.sendStatus(200);
  })
);

// update role
router.patch(
  '/update-role',
  author([]),
  handlerWrapper(async (req, res) => {
    const { accountId, roles } = updateRoleSchema.parse(req.body);
    if (!roles.includes(Role.User)) {
      roles.push(Role.User);
    }
    const coll = db.collection(Collections.Accounts);
    await coll.updateOne({ accountId }, { $set: { roles } });
    res.sendStatus(200);
  })
);

router.delete(
  '/',
  author([]),
  handlerWrapper(async (req, res) => {
    const { accountId } = accountIdObjSchema.parse(req.query);
    const result = await db.collection(Collections.Accounts).deleteOne({ accountId });
    return res.json(result);
  })
);

router.get(
  '/:accountId',
  author([Role.User, Role.Account_Reader]),
  handlerWrapper(async (req, res) => {
    const { accountId } = accountIdObjSchema.parse(req.params);
    assertReadAccountInfoPermission({ caller: req.caller, accountId });
    const account = await getAccountByAccountId(accountId);
    const { _id, roles, info, hasChangedPassword, initialPassword } = account;
    return res.json({
      _id,
      accountId,
      roles,
      info,
      hasChangedPassword,
      initialPassword: hasRoleAdmin(req.caller.roles) ? initialPassword : undefined,
    });
  })
);

router.get(
  '/',
  author([Role.Account_Reader]),
  genReadMany({ collName: Collections.Accounts, mode: MiddlewareMode.PASS_NEXT }),
  handlerWrapper(async (req, res) => {
    const newDocs = filterOutUserAccountSensitiveInfo(req.caller, res.result);
    return res.json({ ...res.result, docs: newDocs });
  })
);

export default router;
