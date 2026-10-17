const crypto = require('crypto');

/**
 * Middleware to ensure a guest cart token exists in cookies.
 * If the user is not logged in, it will generate a UUID token
 * and set it as a cookie (if not already present).
 * The token is also attached to req.guestCartToken for use in controllers.
 */
const guestCartMiddleware = (req, res, next) => {
  // If user is logged in, no guest token needed
  if (req.session && req.session.user) {
    req.guestCartToken = null;
    return next();
  }

  // Check for existing guest token in cookie
  let guestToken = req.cookies && req.cookies.guest_cart_token;

  if (!guestToken) {
    // Generate a new UUID v4 token
    guestToken = crypto.randomUUID();
    res.cookie('guest_cart_token', guestToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  req.guestCartToken = guestToken;
  return next();
};

module.exports = guestCartMiddleware;
