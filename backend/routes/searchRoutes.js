import { Router } from 'express';
import { getMoments } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();

  if (!query) {
    return res.json({
      query: '',
      moments: [],
      total: 0
    });
  }

  const moments = getMoments({ query, page: 1, per_page: 20 });

  return res.json({
    query,
    moments: moments.data,
    total: moments.pagination.total
  });
});

export default router;
