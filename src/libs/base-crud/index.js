import { appEnv } from '#src/config/env.js';
import { db } from '#src/db.js';
import { z } from 'zod';
import { handlerWrapper } from '../../core/utils.js';

const MiddlewareMode = {
  DIRECT_RESPONSE: 'DirectResponse',
  PASS_NEXT: 'PassNext',
};

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(0).max(appEnv.PAGINATION_MAX_PAGE_SIZE).default(10),
  sort: z.string().default('{"_id":-1}'),
  q: z.string().default('{}'),
  search: z.string().nullable().default(null),
  extend: z.string().optional(),
});

// migrate don't use this function
// use composition pattern instead
function genReadMany({ collName, mode = MiddlewareMode.DIRECT_RESPONSE, database = db }) {
  return handlerWrapper(async (req, res, next) => {
    // 1. Validate queries
    const value = querySchema.parse(req.query);

    // 2. Get query
    let { page, pageSize, sort, q, search } = value;
    try {
      q = JSON.parse(q);
      sort = JSON.parse(sort);
      search = JSON.parse(search);
    } catch (error) {
      return res.status(400).json(`Invalid json: check your params: q: ${q}, sort: ${sort}, search: ${search}!`);
    }
    let query = { deleted: { $exists: false }, ...q, ...(req.beQuery || {}) };
    if (search) {
      const s = [];
      const entries = Object.entries(search);
      if (entries.length !== 0) {
        entries.forEach((entry) => {
          const key = entry[0];
          const value = entry[1];
          s.push({ [key]: new RegExp(value, 'i') });
        });
        // query['$or'] = s;
        // magic: use $and here to avoid overriding $or from req.beQuery
        query['$and'] = [{ $or: s }];
      }
    }

    // 3. calculate total page
    const col = database.collection(collName);
    const docCount = await col.countDocuments(query);
    const pageCount = Math.floor((docCount + pageSize - 1) / pageSize);

    // 4. Read docs
    const docs = await col
      .find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    // 5. return
    const result = { docs, page, pageSize, pageCount, docCount };
    if (mode === MiddlewareMode.DIRECT_RESPONSE) return res.json(result);
    res.result = result;
    next();
  });
}

export { MiddlewareMode, genReadMany, querySchema };
