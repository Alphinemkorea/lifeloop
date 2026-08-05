import { Router } from 'express';
import { getAdminStats, getAllUsersForAdmin, resetDatabaseToSeed, clearAllData } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/stats', (req, res) => {
  const stats = getAdminStats();
  return res.json({ stats });
});

router.get('/users', (req, res) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.per_page) || 10;
  const result = getAllUsersForAdmin(page, perPage);
  return res.json(result);
});

router.post('/reset-db', (req, res) => {
  resetDatabaseToSeed();
  return res.json({ message: 'Database reset to initial sample data successfully.' });
});

router.post('/clear-all', (req, res) => {
  clearAllData();
  return res.json({ message: 'All data cleared! Starting from a completely clean slate.' });
});

export default router;
