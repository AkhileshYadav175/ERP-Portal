const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const writeLog = (level, message, meta = '') => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | Meta: ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  
  // Write to console
  if (level === 'error') {
    console.error(logLine.trim());
  } else if (level === 'warn') {
    console.warn(logLine.trim());
  } else {
    console.log(logLine.trim());
  }
  
  // Write to files
  try {
    fs.appendFileSync(path.join(LOGS_DIR, `${level}.log`), logLine);
    fs.appendFileSync(path.join(LOGS_DIR, 'combined.log'), logLine);
  } catch (err) {
    console.error('Failed to write log file:', err.message);
  }
};

const logger = {
  info: (message, meta) => writeLog('info', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
};

module.exports = logger;
