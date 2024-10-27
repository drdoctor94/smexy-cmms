const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Check for the token in cookies
  const token = req.cookies.token; // Get the token from cookies

  // If there is no token in cookies, deny authorization
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure the token is valid and contains user information
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Attach the decoded user info to the request object (e.g., req.user)
    req.user = { _id: decoded.id, role: decoded.role }; // Set req.user._id and req.user.role

    // You can log to confirm that user data is set properly
    console.log('Decoded JWT:', decoded);
    
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
