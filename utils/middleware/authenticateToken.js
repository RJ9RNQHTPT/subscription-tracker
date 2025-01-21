const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('[AUTHENTICATE] No token provided');
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error('[AUTHENTICATE] Token verification failed:', err.message);
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }

    console.log('[AUTHENTICATE] Decoded token:', decodedToken);
    req.user = decodedToken; // Attach decoded token data (including userId)
    next();
  });
}

module.exports = authenticateToken;



