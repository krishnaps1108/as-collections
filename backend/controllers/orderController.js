import WhatsAppLog from '../models/WhatsAppLog.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Log WhatsApp checkout intent (Support logging multiple items from cart)
export const logWhatsAppOrder = async (req, res) => {
  try {
    const { name, phone, cartItems } = req.body;
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    const savedLogs = [];
    for (const item of cartItems) {
      const log = new WhatsAppLog({
        customerName: name || 'Guest',
        customerPhone: phone || '',
        productName: item.name,
        variantSize: item.selectedSize || item.size || 'Standard',
        price: item.price * (item.quantity || 1),
        category: item.category || 'Uncategorized'
      });
      const saved = await log.save();
      savedLogs.push(saved);
    }

    res.status(201).json({ message: 'Order checkout intent logged!', logs: savedLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Sales Reports (Daily breakdown and category breakdown)
export const getSalesReports = async (req, res) => {
  try {
    const logs = await WhatsAppLog.find({});

    // Group sales by date (YYYY-MM-DD)
    const dailySalesMap = {};
    const categorySalesMap = {};

    logs.forEach(log => {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      
      // Daily revenue
      dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + log.price;

      // Category breakdown
      const cat = log.category || 'Uncategorized';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + log.price;
    });

    const dailySales = Object.keys(dailySalesMap).map(date => ({
      date,
      revenue: dailySalesMap[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    const categorySales = Object.keys(categorySalesMap).map(category => ({
      category,
      revenue: categorySalesMap[category]
    }));

    res.json({ dailySales, categorySales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Customer Message Log
export const getCustomerMessages = async (req, res) => {
  try {
    const messages = await WhatsAppLog.find({}).sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Top Products Report
export const getTopProducts = async (req, res) => {
  try {
    const logs = await WhatsAppLog.find({});

    const productSalesMap = {};
    logs.forEach(log => {
      const pName = log.productName;
      if (!productSalesMap[pName]) {
        productSalesMap[pName] = { count: 0, revenue: 0 };
      }
      productSalesMap[pName].count += 1;
      productSalesMap[pName].revenue += log.price;
    });

    const topProducts = Object.keys(productSalesMap).map(name => ({
      name,
      count: productSalesMap[name].count,
      revenue: productSalesMap[name].revenue
    })).sort((a, b) => b.count - a.count);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Register a new Seller
export const addSeller = async (req, res) => {
  try {
    const { email, password, name, phone, age } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const sellerExists = await User.findOne({ email });
    if (sellerExists) {
      return res.status(400).json({ message: 'A user or seller with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSeller = await User.create({
      name: name || 'AS Partner Seller',
      email,
      password: hashedPassword,
      age: age ? Number(age) : 30,
      phone: phone || '+91 7395 832 383',
      role: 'seller'
    });

    res.status(201).json({
      message: 'Seller registered successfully!',
      seller: {
        id: newSeller._id,
        name: newSeller.name,
        email: newSeller.email,
        role: newSeller.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
