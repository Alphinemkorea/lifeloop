import { Router } from 'express';
import { getProfileByUserId, updateProfile, findUserById } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const user = findUserById(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = getProfileByUserId(req.params.userId);
  const { password_hash, ...safeUser } = user;

  return res.json({ user: safeUser, profile });
});

router.put('/', authenticateToken, (req, res) => {
  try {
    const {
      full_name,
      username,
      age,
      instagram_handle,
      avatar_url,
      bio,
      favorite_quote,
      birthday,
      location
    } = req.body;

    const profile = updateProfile(req.user.id, {
      full_name,
      username,
      age,
      instagram_handle,
      avatar_url,
      bio,
      favorite_quote,
      birthday,
      location
    });

    const updatedUser = findUserById(req.user.id);
    const { password_hash, ...safeUser } = updatedUser || {};

    return res.json({ message: 'Profile updated successfully', profile, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

export default router;
