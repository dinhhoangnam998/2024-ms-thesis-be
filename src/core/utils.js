import { InputDataInvalid } from '#src/qa/errors.js';
import { fileTypeFromBuffer } from 'file-type';

export const handlerWrapper = (handler) => async (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export async function sleeper(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export async function assertImageFile(buffer) {
  const result = await fileTypeFromBuffer(buffer);
  if (!result || !result.mime.startsWith('image')) throw new InputDataInvalid({ message: 'File ảnh không hợp lệ!' });
}

export function convertCertParamsLongToShort(params) {
  const CN = params.name;
  const C = params.country;
  const ST = params.province;
  const L = params.locality;
  const O = params.organization;
  const OU = params.unit;
  return { CN, C, ST, L, O, OU };
}

export function isValidEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export function getEmailAddressOfAccount(account) {
  if (isValidEmail(account?.info?.email)) return account.info.email;
  else if (isValidEmail(account.accountId)) return account.accountId;
  return null;
}
