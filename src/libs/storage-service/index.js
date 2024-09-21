import { appEnv } from '#src/config/env.js';
import { FileStorageProviderEnum } from '#src/constant/index.js';
import { fileServerProvider } from './file-server.js';
import { ggCloudProvider } from './gg-cloud.js';


export const storageProvider =
  appEnv.FILE_STORAGE_PROVIDER === FileStorageProviderEnum.enum.BSIGN_FILE_SERVER
    ? fileServerProvider
    : ggCloudProvider;
