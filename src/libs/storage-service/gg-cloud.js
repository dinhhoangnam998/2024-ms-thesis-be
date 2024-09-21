import { appEnv } from '#src/config/env.js';
import { Storage } from '@google-cloud/storage';
import { DateTime } from 'luxon';

const storage = new Storage({ keyFilename: appEnv.GCS_SA_KEY_FILE_PATH });
const bucketName = appEnv.GCS_BUCKET_NAME;
const gscExpireTime = appEnv.GCS_SIGNED_URL_EXPIRE_TIME_IN_MINUTES;

export function getSafeCurrentDateTimeStr() {
  const now = DateTime.now();
  return {
    date: now.toFormat('yyyy-MM-dd'),
    time: now.toFormat("HH'h'mm'm'ss's"),
    zone: now.toFormat('ZZ').replace(':', 'h').replace('+', ''),
  };
}

export const ggCloudProvider = {
  async upload(buffer, baseFolder, fileName) {
    const { date, time, zone } = getSafeCurrentDateTimeStr();
    // Generate a file safety file name
    const safeFileName = decodeURIComponent(encodeURIComponent(fileName));

    const fileDest = `${baseFolder}/${date}/${time}Z${zone}/${safeFileName}`;
    await storage.bucket(bucketName).file(fileDest).save(buffer);
    const encodedFileDest = encodeURI(fileDest);
    return { fileDest, encodedFileDest };
  },

  async download(fileDest) {
    const contents = await storage.bucket(bucketName).file(fileDest).download();
    return contents[0];
  },

  async genSignedURL(fileDest) {
    const [url] = await storage
      .bucket(bucketName)
      .file(fileDest)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + gscExpireTime * 60 * 1000,
      });
    return url;
  },
};

await storage.bucket(bucketName).setCorsConfiguration([
  {
    maxAgeSeconds: 3600,
    method: ['GET'],
    origin: ['*'],
    responseHeader: ['Content-Type'],
  },
]);
