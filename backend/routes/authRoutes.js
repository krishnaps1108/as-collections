import express from 'express';
import { registerUser, loginUser, googleAuthSimulate, getProfile } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token for profile routing
export const protectUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(' ')[1];

  // If no auth header, look for cookie token
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies['token'];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token failed verification' });
  }
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/google', googleAuthSimulate);
router.get('/profile', protectUser, getProfile);

export default router;