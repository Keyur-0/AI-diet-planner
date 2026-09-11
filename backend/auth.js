const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'pulsefit_super_secret_jwt_key_2026_dev';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@pulsefit.com').toLowerCase().trim();

// Pre-compute or load bcrypt hash for admin password
let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
if (!adminPasswordHash) {
  const defaultPassword = process.env.ADMIN_PASSWORD || 'pulsefit_admin_2026';
  adminPasswordHash = bcrypt.hashSync(defaultPassword, 10);
}

/**
 * Validate submitted admin credentials
 * @param {string} email 
 * @param {string} password 
 * @returns {boolean}
 */
function validateCredentials(email, password) {
  if (!email || !password) return false;
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail !== ADMIN_EMAIL) return false;
  return bcrypt.compareSync(password, adminPasswordHash);
}

/**
 * Generate a signed JWT token for authenticated staff
 * @param {object} payload 
 * @param {string} expiresIn 
 * @returns {string}
 */
function generateToken(payload = {}, expiresIn = '24h') {
  return jwt.sign(
    {
      email: ADMIN_EMAIL,
      role: 'admin',
      ...payload
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Verify a JWT token
 * @param {string} token 
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Express Middleware: Enforce Authenticated Admin Access
 */
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.'
    });
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Expected "Bearer <token>".'
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or corrupted authorization token.'
    });
  }
}

module.exports = {
  validateCredentials,
  generateToken,
  verifyToken,
  requireAdminAuth,
  ADMIN_EMAIL
};
