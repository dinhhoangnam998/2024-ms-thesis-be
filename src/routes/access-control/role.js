import { z } from 'zod';

export const Role = {
  Admin: 'Admin',
  Owner: 'Owner',
  CA: 'CA',
  Board: 'Board',
};

export const RoleEnum = z.nativeEnum(Role);

export function isRoleUserOnly(roles) {
  return roles.length === 1 && roles[0] === Role.User;
}

export function hasRoleAdmin(roles) {
  return roles.includes(Role.Admin);
}
