import { MongoClient } from 'mongodb';
import { appEnv } from './config/env.js';

const client = await new MongoClient(appEnv.MONGODB_CONNECT_STRING, {
  ignoreUndefined: true,
}).connect();
export const db = client.db();

export const Collections = {
  Accounts: 'accounts',
  Certificates: 'certificates',
  FraudReports: 'fraud_reports',
  RefreshTokens: 'refresh_tokens',
  RequestLogs: 'request_logs',
};

await db.collection(Collections.Accounts).createIndex({ accountId: 1 }, { unique: true });
