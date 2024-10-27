// backend/middleware/roleCheck.js

module.exports = function (allowedRoles) {
  return function (req, res, next) {
    // Automatically allow Admins access to all routes
    if (req.user.role === 'Admin') {
      return next();
    }

    // If the user's role is not Admin, check if it's in the allowed roles
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    // Proceed to the next middleware or route if the role is allowed
    next();
  };
};
