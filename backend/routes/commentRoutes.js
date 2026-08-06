import { Router } from 'express';
import { addComment, deleteComment } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.post('/', authenticateToken, (req, res) => {
  try {
    const { moment_id, content } = req.body;
    if (!moment_id || !content) {
      return res.status(400).json({ error: 'Moment ID and content are required.' });
    }

    const comment = addComment(moment_id, req.user.id, content);
    return res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to add comment' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const success = deleteComment(req.params.id, req.user.id, isAdmin);

    if (success) {
      return res.json({ message: 'Comment deleted successfully' });
    }
    return res.status(404).json({ error: 'Comment not found or unauthorized' });
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
});

export default router;
