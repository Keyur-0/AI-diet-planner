const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for AI Meal Plan Generation (POST /api/generate-diet)
 * Limits requests to 5 requests per 15 minutes per IP address to prevent quota abuse.
 */
const dietGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 429,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many diet plan requests. Please try again later.'
    });
  }
});

module.exports = {
  dietGenerationLimiter
};
