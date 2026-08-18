/**
 * Role-based authorization middleware.
 * Restricts access to users who possess one of the allowed roles.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'customer').
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You do not have permission to perform this action."
      });
    }
    next();
  };
};

module.exports = { authorize };
