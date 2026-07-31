/**
 * Custom NoSQL Injection Prevention Middleware
 * Sanitizes req.body, req.query, and req.params by removing any keys starting with "$"
 * to prevent attackers from injecting MongoDB operator queries.
 */
const nosqlSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

module.exports = nosqlSanitizer;
