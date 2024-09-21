import axios from 'axios';
import { appEnv } from './env.js';
import { MB } from '#src/constant/index.js';

const baseAxios = axios.create({
  maxContentLength: appEnv.REQUEST_SIZE_LIMIT_IN_MB * MB,
  maxBodyLength: appEnv.REQUEST_SIZE_LIMIT_IN_MB * MB,
});

export { baseAxios };
