const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format.');
    return res.status(401).send({ message: 'No token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token); // Extract the token from the 'Bearer' prefix

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message); // Log error message for clarity
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: 'Token has expired. Please log in again.' });
      }
      return res.status(401).send({ message: 'Failed to authenticate token.' });
    }

    // Attach user ID to request
    req.userId = decoded.id;
    console.log('Authenticated user ID:', req.userId);
    next();
  });
};

module.exports = authenticate;
