import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, 'secretkey123');
        req.user = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

export default protect;
