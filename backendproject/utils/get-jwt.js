const jwt = require("jsonwebtoken");

/**
 * Generates a JSON Web Token (JWT) for an authenticated user.
 * @param {Object} user - User object containing _id and role.
 * @returns {string} Signed JWT token.
 */
const getJWT = (user) => {
  const payload = {
    id: user._id,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d"
  });
};

module.exports = getJWT;
