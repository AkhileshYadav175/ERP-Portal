// In-memory sliding-window request cache mapped by IP
const ipRequestCache = new Map();

/**
 * Custom sliding-window Rate Limiter Middleware
 * Throttles repetitive requests to prevent brute force and DDoS floods on sensitive operations.
 * 
 * @param {number} windowMs - Time window bounds in milliseconds (default 15 mins)
 * @param {number} maxRequests - Max permitted requests within the window (default 100)
 */
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequestCache.has(ip)) {
      ipRequestCache.set(ip, []);
    }

    const requestTimes = ipRequestCache.get(ip);

    // Filter out timestamps that fall outside the active sliding window
    const activeTimes = requestTimes.filter(timestamp => now - timestamp < windowMs);
    
    if (activeTimes.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests generated from this IP. Please try again after 15 minutes.'
      });
    }

    // Record the current request timestamp
    activeTimes.push(now);
    ipRequestCache.set(ip, activeTimes);

    // Attach headers indicating status
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - activeTimes.length));

    next();
  };
};

module.exports = rateLimiter;
