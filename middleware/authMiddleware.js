const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const protect = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient rights' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  };
};

module.exports = { protect };
