import { upload } from '#src/libs/multer-upload.js';
import { Router } from 'express';
import { pinFileToIPFS } from '#src/libs/pinana.js';

const router = Router();


router.post('/pin-file-to-ipfs', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).send('file is required!');
    const result = await pinFileToIPFS(req.file.buffer, req.file.originalname);
    return res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
