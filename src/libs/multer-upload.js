import multer from "multer";
import { appEnv } from "#src/config/env.js";
import { MB } from "#src/constant/index.js";

export const upload = multer({ limits: { fieldSize: appEnv.REQUEST_SIZE_LIMIT_IN_MB * MB } });

