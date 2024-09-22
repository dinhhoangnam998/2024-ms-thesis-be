import { createLogMiddleware, getErrorHandlerMiddleware } from '@hoangnam.io/qa-tools';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { appEnv } from './config/env.js';
import { MB } from './constant/index.js';
import { onInit } from './init.js';
import { logConfig } from './qa/logging.js';
import { notifier } from './qa/notifying.js';
import accountRouter from './routes/account/index.js';
import ownerRouter from './routes/owner/index.js';
import caRouter from './routes/ca/index.js';
import healthCheckRouter from './routes/health-check/index.js';

const app = express();
app.use(express.json({ limit: appEnv.REQUEST_SIZE_LIMIT_IN_MB * MB }));
app.use(express.urlencoded({ limit: appEnv.REQUEST_SIZE_LIMIT_IN_MB * MB, extended: false }));
app.use(cors());

// logs
app.use(createLogMiddleware(app, logConfig));

// endpoint
app.use('/api/account', accountRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/ca', caRouter);
app.use(healthCheckRouter);

// handle errors
const errorHandler = getErrorHandlerMiddleware(notifier, (req) => req.caller, appEnv.APP_NAME);
app.use(errorHandler);

const PORT = appEnv.PORT || 8000;
app.listen(PORT, () => console.log(`${appEnv.APP_NAME} listening on port ${PORT}!`));

await onInit();
