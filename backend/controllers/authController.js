import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Note the .js extension for ES modules

// Signup controller
export const signup = async (req, res) => {
    try {
        const { name, email, password, cycleStartDate, cycleLength } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // DO NOT manually hash password here — schema does it automatically
        const newUser = new User({
            name,
            email,
            password, // Plain password — will be hashed in User.js schema
            cycleStartDate,
            cycleLength
        });

        await newUser.save();
        console.log('User saved:', newUser);

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, 'secretkey123', { expiresIn: '1h' });

        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login request:', email, password); 

        const user = await User.findOne({ email });
        console.log('User found:', user);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        console.log("Stored password (hashed):", user.password);

        const isMatch = await bcrypt.compare(password, user.password); 
        console.log('Password match:', isMatch); 

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, 'secretkey123', { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
