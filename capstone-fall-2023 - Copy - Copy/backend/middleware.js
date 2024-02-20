const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers.authorization; //"Authorization" header

  if (!token) {
    //console.log("here");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }
    // Attach the decoded data to the request
    req.user = decoded.user; 
    req.userId = decoded.userId;
    next();
  });
}

module.exports = authenticateToken;
