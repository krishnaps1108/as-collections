import express from 'express';
import { getReviews, addReview, deleteReview } from '../controllers/reviewController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to protect routes for Sellers or Admins
const protectSellerOrAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      if (!cookie) return acc;
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});
    token = cookies['token'];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'seller' && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, seller or admin rights required' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token failed verification' });
  }
};

router.get('/', getReviews);
router.post('/', addReview);
router.delete('/:id', protectSellerOrAdmin, deleteReview);

export default router;