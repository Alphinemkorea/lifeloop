import { Router } from 'express';
import { getMoments, getMomentById, createMoment, deleteMoment } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.get('/', (req, res) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.per_page) || 10;
  const space_id = req.query.space_id;
  const user_id = req.query.user_id;
  const mood = req.query.mood;
  const category = req.query.category;
  const tag = req.query.tag;
  const query = req.query.query;

  const result = getMoments({
    space_id,
    user_id,
    mood,
    category,
    tag,
    query,
    page,
    per_page: perPage
  });

  return res.json(result);
});

router.get('/:id', (req, res) => {
  const currentUserId = req.query.user_id;
  const moment = getMomentById(req.params.id, currentUserId);

  if (!moment) {
    return res.status(404).json({ error: 'Moment not found' });
  }

  return res.json({ moment });
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { space_id, title, description, mood, category, date, photo_urls, song, location, unlock_date, audio_url, tags } = req.body;

    if (!space_id || !title || !mood) {
      return res.status(400).json({ error: 'Space ID, Title, and Mood are required.' });
    }

    const moment = createMoment({
      space_id,
      user_id: req.user.id,
      title,
      description: description || '',
      mood,
      category: category || 'General',
      location: location || '',
      unlock_date: unlock_date || null,
      audio_url: audio_url || null,
      tags: tags || [],
      date,
      photo_urls,
      song
    });

    return res.status(201).json({ message: 'Moment posted successfully!', moment });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create moment' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const success = deleteMoment(req.params.id, req.user.id, isAdmin);

    if (success) {
      return res.json({ message: 'Moment deleted successfully.' });
    }
    return res.status(404).json({ error: 'Moment not found or unauthorized.' });
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
});

export default router;
