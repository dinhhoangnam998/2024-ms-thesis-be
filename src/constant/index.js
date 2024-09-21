import { z } from 'zod';

export const MB = 1073741824;

export const FileStorageProviderEnum = z.enum(['GG_CLOUD_STORAGE', 'BSIGN_FILE_SERVER']);
