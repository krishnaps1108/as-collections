import express from 'express';
import { logWhatsAppOrder, getSalesReports, getCustomerMessages, getTopProducts, addSeller } from '../controllers/orderController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin protection middleware
const protectAdmin = (req, res, next) => {
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
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, admin role required' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token failed verification' });
  }
};

router.post('/orders/whatsapp-log', logWhatsAppOrder);

// Admin-only metrics routes
router.get('/admin/sales', protectAdmin, getSalesReports);
router.get('/admin/customers', protectAdmin, getCustomerMessages);
router.get('/admin/top-products', protectAdmin, getTopProducts);
router.post('/admin/add-seller', protectAdmin, addSeller);

export default router;
