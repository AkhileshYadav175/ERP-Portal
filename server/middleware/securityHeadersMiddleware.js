/**
 * Custom Security Headers Middleware (Helmet Alternative)
 * Sets critical HTTP response headers to secure the portal against common web exploits.
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks by blocking frame embedding
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing by instructing browsers to adhere strictly to declared Content-Types
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information sent on navigations
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable client-side cross-site scripting (XSS) filter mechanisms which can introduce vulnerabilities
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy (CSP) configurations
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
  );

  next();
};

module.exports = securityHeaders;
