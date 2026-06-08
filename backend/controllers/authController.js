import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User / Seller / Admin Register
export const registerUser = async (req, res) => {
  try {
    const { name, age, phone, email, password, role } = req.body;
    
    if (!name || !age || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      age: Number(age),
      phone,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login (Saves token to HttpOnly cookie and returns it)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        age: user.age
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth simulation
export const googleAuthSimulate = async (req, res) => {
  try {
    // Return a mock user token for local development / Google login
    let mockGoogleUser = await User.findOne({ email: 'googleuser@gmail.com' });
    if (!mockGoogleUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('googleOAuthPassword123', salt);
      mockGoogleUser = await User.create({
        name: 'Google User',
        email: 'googleuser@gmail.com',
        password: hashedPassword,
        age: 25,
        phone: '+91 99999 99999',
        role: 'user'
      });
    }

    const token = jwt.sign(
      { id: mockGoogleUser._id, role: mockGoogleUser.role, email: mockGoogleUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token,
      user: {
        id: mockGoogleUser._id,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        role: mockGoogleUser.role,
        phone: mockGoogleUser.phone,
        age: mockGoogleUser.age
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch current user details from JWT token
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};