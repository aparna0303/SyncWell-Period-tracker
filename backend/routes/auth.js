import { Router } from 'express';
import { signup, login } from '../controllers/authController.js'; // Import existing controller functions
import pkg from 'jsonwebtoken';
const { verify } = pkg;
import User from '../models/User.js';

const router = Router();

// Routes using controller functions
router.post('/signup', signup);
router.post('/login', login);

// Middleware to authenticate user
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('A token is required for authentication');
  try {
    const decoded = verify(token, 'secretkey123');
    req.user = decoded;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  next();
};

// Route to get logged-in user data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // userId matches what you signed in token
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
