import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';
import { appEnv } from '#src/config/env.js';
const JWT = appEnv.PINATA_JWT

export const pinFileToIPFS = async (buffer, fileName) => {
  const formData = new FormData();
  formData.append('file', buffer, { filename: fileName });
  const pinataMetadata = JSON.stringify({
    name: fileName,
  });
  formData.append('pinataMetadata', pinataMetadata);
  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    maxBodyLength: 'Infinity',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      Authorization: `Bearer ${JWT}`,
    },
  });
  console.log(res.data);
  return res.data;
};