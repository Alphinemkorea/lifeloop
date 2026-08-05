import { Router } from 'express';
import {
  getAllSpaces,
  getSpaceById,
  createSpace,
  updateSpaceAppearance,
  removeSpaceMember,
  joinSpaceByInviteCode,
  leaveSpace,
  getSpaceStats,
  getWeeklyTree
} from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.get('/', (req, res) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.per_page) || 10;
  const userId = req.query.user_id || undefined;
  const joinedOnly = req.query.joined_only === 'true' || req.query.joined_only === '1';

  const result = getAllSpaces(userId, page, perPage, joinedOnly);
  return res.json(result);
});

router.get('/:id', (req, res) => {
  const userId = req.query.user_id || undefined;
  const space = getSpaceById(req.params.id, userId);

  if (!space) {
    return res.status(404).json({ error: 'Space not found' });
  }
  return res.json({ space });
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, description, icon, cover_url, custom_code } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Space name is required.' });
    }

    const space = createSpace({
      name: name.trim(),
      description: description ? description.trim() : '',
      icon: icon || '🌿',
      cover_url,
      custom_code,
      created_by: req.user.id
    });

    return res.status(201).json({ message: 'Space created successfully', space });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create space' });
  }
});

// Update Space Appearance (All Members allowed)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, description, icon, cover_url } = req.body;
    const updatedSpace = updateSpaceAppearance(req.params.id, req.user.id, {
      name,
      description,
      icon,
      cover_url
    });
    return res.json({ message: 'Space appearance updated successfully!', space: updatedSpace });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update space' });
  }
});

// Remove Member from Space (Owner only)
router.delete('/:id/members/:targetUserId', authenticateToken, (req, res) => {
  try {
    const success = removeSpaceMember(req.params.id, req.user.id, req.params.targetUserId);
    if (success) {
      return res.json({ message: 'Member removed from space.' });
    }
    return res.status(404).json({ error: 'Member not found in space.' });
  } catch (err) {
    return res.status(403).json({ error: err.message || 'Failed to remove member' });
  }
});

router.post('/join', authenticateToken, (req, res) => {
  try {
    const { invite_code, nickname } = req.body;
    if (!invite_code) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }

    const result = joinSpaceByInviteCode(req.user.id, invite_code, nickname);
    return res.json({
      message: result.already_member ? 'You are already a member of this space.' : 'Successfully joined space!',
      space: result.space,
      membership: result.membership
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to join space' });
  }
});

router.post('/:id/leave', authenticateToken, (req, res) => {
  const success = leaveSpace(req.user.id, req.params.id);
  if (success) {
    return res.json({ message: 'Successfully left the space.' });
  }
  return res.status(400).json({ error: 'You are not a member of this space.' });
});

router.get('/:id/stats', (req, res) => {
  const stats = getSpaceStats(req.params.id);
  if (!stats) {
    return res.status(404).json({ error: 'Space not found' });
  }
  return res.json({ stats });
});

router.get('/:id/weekly-tree', (req, res) => {
  const treeData = getWeeklyTree(req.params.id);
  if (!treeData) {
    return res.status(404).json({ error: 'Space not found' });
  }
  return res.json({ tree: treeData });
});

export default router;
