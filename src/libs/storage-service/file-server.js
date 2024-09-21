import { appEnv } from '#src/config/env.js';
import axios from 'axios';
import FormData from 'form-data';

const fileServerClient = axios.create({
  baseURL: appEnv.FILE_SERVER_URL,
  headers: { Authorization: `Bearer ${appEnv.FILE_SEVER_ACCESS_TOKEN}` },
});

export const fileServerProvider = {
  async upload(buffer, baseFolder, fileName) {
    const form = new FormData();
    form.append('file', buffer, { filename: `${fileName}` });
    form.append('folder', baseFolder);
    const response = await fileServerClient.post('/write', form, {
      headers: { ...form.getHeaders() },
    });
    return response.data;
  },

  async download(fileDest) {
    const response = await fileServerClient.post(
      '/download',
      { fileDest },
      { responseType: 'arraybuffer' }
    );
    return response.data;
  },

  async genSignedURL(fileDest) {
    const response = await fileServerClient.post('/sign-read-token', {
      fileDest,
    });
    const token = response.data;
    return `${appEnv.FILE_SERVER_URL}/read?token=${token}`;
  },
};
