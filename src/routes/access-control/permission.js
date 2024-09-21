import { BadRequest } from '#src/qa/errors.js';
import { isRoleUserOnly } from './role.js';

export function assertPermission({ caller, accountId }) {
  if (isRoleUserOnly(caller.roles) && accountId !== caller.accountId) {
    throw new BadRequest({ message: 'Vai trò User không thể truy cập thông tin của người khác!' });
  }
}
