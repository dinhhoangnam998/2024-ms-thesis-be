import { appEnv } from '#src/config/env.js';

export const logConfig = {
  appName: appEnv.APP_NAME,
  extractCallerFunc: (req) => req.caller,
  ignoreRoutes: [
    { method: 'GET', route: '/request-logs' },
    { method: 'GET', route: '/health-check' },
  ],
  sensitiveRoutes: ['/login', '/sign-up'],
  mongoConfig: { connectionString: appEnv.MONGODB_CONNECT_STRING, collectionName: 'request_logs' },
  TZ: appEnv.TIME_ZONE,
};
