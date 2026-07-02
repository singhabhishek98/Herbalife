const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { protect };
