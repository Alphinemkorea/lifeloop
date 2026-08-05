import jwt from 'jsonwebtoken';
import { findUserById } from './db.js';
import { config } from './config.js';

const JWT_SECRET = config.jwtSecret;

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required (401 Unauthorized).' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token (401 Unauthorized).' });
    }

    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    };

    next();
  });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required (403 Forbidden).' });
    }

    next();
  };
}
