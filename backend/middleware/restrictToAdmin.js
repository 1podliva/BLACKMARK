const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('restrictToAdmin: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (decoded.role !== 'admin') {
      console.log('restrictToAdmin: User is not admin, role:', decoded.role);
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
  } catch (err) {
    console.error('restrictToAdmin Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};