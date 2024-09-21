import { NotAllowed } from '#src/qa/errors.js';
import { Role, hasRoleAdmin, isRoleUserOnly } from '#src/routes/access-control/role.js';

// only admin can create account with privileged roles
export function assertCreateAccountPermission({ callerRoles, creatingAccountRoles }) {
  if (!hasRoleAdmin(callerRoles) && !isRoleUserOnly(creatingAccountRoles)) {
    throw new NotAllowed({ message: 'Bạn không được phép tạo người dùng với các vai trò này!' });
  }
}

// only admin can update account info of others
export function assertUpdateAccountInfoPermission({ caller, accountId }) {
  if (!hasRoleAdmin(caller.roles) && accountId !== caller.accountId)
    throw new NotAllowed({ message: 'Chỉ Admin mới được quyền cập nhật thông tin người khác!' });
}

// role User is not allowed to read account info of others
export function assertReadAccountInfoPermission({ caller, accountId }) {
  if (caller.roles.includes(Role.Account_Reader) || caller.roles.includes(Role.Admin)) return;
  if (accountId !== caller.accountId) {
    throw new NotAllowed({ message: 'Vai trò User không có quyền truy cập thông tin của người khác' });
  }
}
