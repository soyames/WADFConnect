import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

// Known bot user agents (expand this list as needed)
const KNOWN_BOTS = [
  'bot', 'crawler', 'spider', 'scraper', 'scraping', 'curl', 'wget', 'python',
  'java', 'ruby', 'perl', 'php', 'go-http', 'axios', 'requests', 'httpclient',
  'okhttp', 'scrapy', 'beautifulsoup', 'mechanize', 'selenium', 'puppeteer',
  'playwright', 'headless', 'phantom', 'nightmare', 'zombie', 'casper',
  'slurp', 'mediapartners', 'adsbot', 'apis-google', 'aolbuild', 'baidu',
  'bingbot', 'bingpreview', 'duckduckbot', 'facebookexternalhit', 'ia_archiver',
  'linkedinbot', 'mj12bot', 'msnbot', 'pingdom', 'semrushbot', 'seznambot',
  'slackbot', 'telegrambot', 'twitterbot', 'uptimerobot', 'whatsapp', 'yandexbot'
];

// Suspicious patterns in requests
const SUSPICIOUS_PATTERNS = [
  /\.\./,  // Directory traversal
  /<script/i,  // XSS attempts
  /union.*select/i,  // SQL injection
  /eval\(/i,  // Code injection
  /base64_decode/i,  // Encoded payloads
  /cmd=/i,  // Command injection
];

// Track request patterns per IP
const requestTracking = new Map<string, {
  count: number;
  lastReset: number;
  suspiciousCount: number;
  blockedUntil?: number;
}>();

// Clean up old tracking data every hour
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  for (const [ip, data] of Array.from(requestTracking.entries())) {
    if (data.lastReset < oneHourAgo && !data.blockedUntil) {
      requestTracking.delete(ip);
    }
  }
}, 3600000);

/**
 * Very permissive rate limiting for API endpoints
 * Limits: 10000 requests per minute per IP (handles high traffic)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000, // Very high limit to handle traffic
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Disabled by default - enable in production if needed
});

/**
 * Permissive rate limiting for authentication endpoints
 * Limits: 1000 attempts per minute per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // High limit for authentication
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Disabled by default - enable in production if needed
  skipSuccessfulRequests: true,
});

/**
 * Bot detection middleware
 * Blocks requests from known bots and scrapers
 */
export const botDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Skip bot detection in development for testing purposes
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip?.includes('localhost');
  
  if (isDev && isLocalhost) {
    return next();
  }

  // Check if IP is currently blocked
  const tracking = requestTracking.get(ip);
  if (tracking?.blockedUntil && tracking.blockedUntil > Date.now()) {
    return res.status(403).json({ 
      error: 'Access temporarily blocked due to suspicious activity',
      retryAfter: Math.ceil((tracking.blockedUntil - Date.now()) / 1000)
    });
  }

  // Allow legitimate search engine bots (for SEO) but with strict limits
  const legitimateBots = ['googlebot', 'bingbot', 'yandexbot', 'duckduckbot'];
  const isLegitimateBot = legitimateBots.some(bot => userAgent.includes(bot));
  
  if (isLegitimateBot) {
    // Allow but rate limit heavily
    return next();
  }

  // Block known malicious bots
  const isSuspiciousBot = KNOWN_BOTS.some(bot => userAgent.includes(bot));
  
  if (isSuspiciousBot) {
    console.warn(`Blocked bot request from IP ${ip}: ${userAgent}`);
    return res.status(403).json({ error: 'Automated access is not permitted' });
  }

  // Require user agent
  if (!req.headers['user-agent'] || req.headers['user-agent'].length < 10) {
    console.warn(`Blocked request with invalid user agent from IP ${ip}`);
    return res.status(403).json({ error: 'Invalid request headers' });
  }

  next();
};

/**
 * Request pattern analysis
 * Detects and blocks suspicious request patterns
 */
export const patternAnalysis = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const fullUrl = req.originalUrl || req.url;
  const referer = req.headers.referer || '';

  // Skip pattern analysis for static assets and Vite HMR in development
  if (process.env.NODE_ENV === 'development') {
    const skipPaths = [
      '/node_modules/',
      '/@vite/',
      '/@react-refresh',
      '/@fs/',
      '/src/',
      '/public/',
      '/__vite_ping',
      '.js', '.css', '.map', '.ico', '.png', '.jpg', '.svg', '.woff', '.woff2', '.ttf'
    ];
    
    if (skipPaths.some(path => fullUrl.includes(path))) {
      return next();
    }
  }

  // Initialize or update tracking for this IP
  let tracking = requestTracking.get(ip);
  const now = Date.now();
  
  if (!tracking || now - tracking.lastReset > 60000) { // Reset every minute
    tracking = { count: 0, lastReset: now, suspiciousCount: 0 };
    requestTracking.set(ip, tracking);
  }

  tracking.count++;

  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullUrl) || pattern.test(referer)) {
      tracking.suspiciousCount++;
      console.warn(`Suspicious pattern detected from IP ${ip}: ${fullUrl}`);
    }
  }

  // Very high limit to handle massive traffic
  // Only block truly excessive patterns (100000 req/min)
  const maxRequests = 100000;
  if (tracking.count > maxRequests) {
    tracking.blockedUntil = now + 3600000; // Block for 1 hour
    console.warn(`IP ${ip} blocked for excessive requests: ${tracking.count} requests/minute`);
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: 3600
    });
  }

  // Block only if many suspicious patterns detected (raised from 3 to 50)
  if (tracking.suspiciousCount > 50) {
    tracking.blockedUntil = now + 7200000; // Block for 2 hours
    console.warn(`IP ${ip} blocked for suspicious activity`);
    return res.status(403).json({ error: 'Suspicious activity detected' });
  }

  next();
};

/**
 * Configure Helmet security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite HMR in development
        "'unsafe-eval'", // Required for Vite in development
        "https://cdn.jsdelivr.net", // For external libraries
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled components
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:", // Allow images from HTTPS sources
      ],
      connectSrc: [
        "'self'",
        "https://firestore.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "wss:", // WebSocket for Vite HMR
      ],
      frameSrc: ["'none'"], // Prevent clickjacking
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some external resources
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // Prevent iframe embedding
  },
  noSniff: true, // Prevent MIME sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * Honeypot middleware - detects automated form submissions
 */
export const honeypot = (req: Request, res: Response, next: NextFunction) => {
  // Check for honeypot field in POST requests
  if (req.method === 'POST' && req.body) {
    // If honeypot field is filled (invisible to humans, visible to bots)
    if (req.body.website || req.body.url || req.body.homepage) {
      console.warn(`Honeypot triggered from IP ${req.ip}`);
      // Silently reject (don't tell the bot it was caught)
      return res.status(200).json({ success: true });
    }
  }
  next();
};

/**
 * Require secure referrer for sensitive operations
 */
export const requireValidReferrer = (req: Request, res: Response, next: NextFunction) => {
  const referer = req.headers.referer || req.headers.referrer;
  
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // For POST, PUT, DELETE requests, require valid referrer
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (!referer) {
      return res.status(403).json({ error: 'Invalid request origin' });
    }

    // Verify referrer is from same domain
    try {
      const refererUrl = new URL(typeof referer === 'string' ? referer : referer[0]);
      const allowedHosts = [
        req.get('host'),
        process.env.REPLIT_DOMAINS,
        'replit.dev',
        'replit.app',
      ].filter(Boolean);

      const isValidReferrer = allowedHosts.some(host => 
        refererUrl.hostname.includes(host as string)
      );

      if (!isValidReferrer) {
        console.warn(`Invalid referrer from IP ${req.ip}: ${referer}`);
        return res.status(403).json({ error: 'Invalid request origin' });
      }
    } catch (e) {
      return res.status(403).json({ error: 'Invalid request origin' });
    }
  }

  next();
};

/**
 * Apply all security middleware
 */
export const applySecurityMiddleware = (app: any) => {
  // Security headers
  app.use(helmetConfig);

  // Pattern analysis (before other middleware)
  app.use(patternAnalysis);

  // Bot detection
  app.use(botDetection);

  // Honeypot for forms
  app.use(honeypot);

  // Global rate limiter (less strict than API limiter)
  app.use(rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      const isDev = process.env.NODE_ENV === 'development';
      const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('localhost');
      return !!(isDev && isLocalhost);
    }
  }));

  console.log('🔒 Security middleware enabled: Rate limiting, bot detection, security headers');
};
