import User from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    // NOTE: process.env.JWT_SECRET must be set in your .env file
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    // Find user by username OR email
    const user = await User.findOne({ 
        $or: [{ email: identifier }, { username: identifier }] 
    });

    if (user && (await user.matchPassword(password))) {
        res.json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Super Admin creates a new Admin user (Registration)
// @route   POST /api/auth/register
// @access  Private/SuperAdmin
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create the new user with the default role 'admin'
    const user = await User.create({
        username,
        email,
        password, // Password hashing happens in the User model pre-save hook
        role: 'admin', 
    });

    if (user) {
        res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export { loginUser, registerUser };