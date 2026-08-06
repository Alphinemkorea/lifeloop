import { Router } from 'express';
import { toggleReaction } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.post('/toggle', authenticateToken, (req, res) => {
  try {
    const { moment_id, type } = req.body;
    if (!moment_id || !type) {
      return res.status(400).json({ error: 'Moment ID and reaction type are required.' });
    }

    const result = toggleReaction(moment_id, req.user.id, type);
    return res.json({ message: 'Reaction updated', ...result });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to toggle reaction' });
  }
});

export default router;
