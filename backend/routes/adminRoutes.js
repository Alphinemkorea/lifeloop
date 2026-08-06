import { Router } from 'express';
import {
  getAdminStats,
  getAllUsersForAdmin,
  resetDatabaseToSeed,
  clearAllData,
  getSiteSettings,
  updateSiteSettings,
  updateUserRole,
  deleteUserByAdmin,
  deleteMoment,
  getFullDatabaseExport,
  getAllMomentsForAdmin
} from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// Public route to get site settings (banner, tagline, feature flags)
router.get('/site-settings', (req, res) => {
  const settings = getSiteSettings();
  return res.json({ settings });
});

// Protected admin routes below
router.use(authenticateToken);

router.get('/stats', (req, res) => {
  const stats = getAdminStats();
  return res.json({ stats });
});

router.get('/users', (req, res) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.per_page) || 20;
  const result = getAllUsersForAdmin(page, perPage);
  return res.json(result);
});

router.get('/moments', (req, res) => {
  const moments = getAllMomentsForAdmin();
  return res.json({ moments });
});

router.get('/backup', (req, res) => {
  const backup = getFullDatabaseExport();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="lifeloop_backup.json"');
  return res.json(backup);
});


router.put('/site-settings', (req, res) => {
  try {
    const updated = updateSiteSettings(req.body);
    return res.json({ message: 'Site settings updated successfully', settings: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    const user = updateUserRole(req.params.id, role);
    return res.json({ message: `User role updated to ${user.role}`, user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', (req, res) => {
  try {
    const ok = deleteUserByAdmin(req.params.id);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/moments/:id', (req, res) => {
  try {
    const ok = deleteMoment(req.params.id, req.user.id, true);
    if (!ok) return res.status(404).json({ error: 'Moment not found' });
    return res.json({ message: 'Moment deleted by admin successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/reset-db', (req, res) => {
  resetDatabaseToSeed();
  return res.json({ message: 'Database reset to initial sample data successfully.' });
});

router.post('/reset-data', (req, res) => {
  resetDatabaseToSeed();
  return res.json({ message: 'Database reset to initial sample data successfully.' });
});

router.post('/clear-all', (req, res) => {
  clearAllData();
  return res.json({ message: 'All data cleared! Starting from a completely clean slate.' });
});

export default router;
