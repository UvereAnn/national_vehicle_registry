// api-gateway/src/index.js
// Proxies to auth-service only for now — vehicle-service and plate-service
// get added once those branches exist. Every proxy block forwards the FULL
// path unchanged (no pathRewrite) since every backend service mounts its
// routes at the full /api/<service> path — this is the exact bug that cost
// hours last time, fixed by convention from the start this time.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET; // no hardcoded fallback — if this
// is missing, every token verification should fail loudly, not silently
// succeed against a guessable default. Last time, a missing env var fell
// back to a hardcoded secret that didn't match auth-service's, and the
// mismatch was hard to spot. Better to fail fast here.

app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => req.path === '/health',
});
app.use(limiter);

// JWT verification middleware — protects routes that require login
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Translates the verified JWT payload into headers that downstream
// services read (x-user-id, x-user-role) instead of re-verifying the JWT
// themselves — keeps JWT_SECRET knowledge isolated to auth-service + gateway.
const withUserHeaders = (req, res, next) => {
  if (req.user) {
    req.headers['x-user-id'] = String(req.user.id);
    req.headers['x-user-role'] = String(req.user.role);
  }
  next();
};

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

// ── /api/auth — public, no token required to reach login/register ──
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  // No pathRewrite — auth-service mounts at the full /api/auth path
  proxyTimeout: 10000,
  timeout: 10000,
}));

// ── /api/admin — requires a valid token + role check happens inside auth-service ──
app.use('/api/admin', verifyToken, withUserHeaders, createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  // No pathRewrite — auth-service mounts at the full /api/admin path
  proxyTimeout: 10000,
  timeout: 10000,
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// ── /api/vehicles — requires token, staff see only their own submissions ──
app.use('/api/vehicles', verifyToken, withUserHeaders, createProxyMiddleware({
  target: process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  // No pathRewrite — vehicle-service mounts at the full /api/vehicles path
  proxyTimeout: 10000,
  timeout: 10000,
}));

// ── /api/public — no token required (public plate verification) ──
app.use('/api/public', createProxyMiddleware({
  target: process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  // No pathRewrite — vehicle-service mounts at the full /api/public path
  proxyTimeout: 10000,
  timeout: 10000,
}));

// ── /api/stats — requires token (admin dashboard) ──
app.use('/api/stats', verifyToken, withUserHeaders, createProxyMiddleware({
  target: process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  // No pathRewrite — vehicle-service mounts at the full /api/stats path
  proxyTimeout: 10000,
  timeout: 10000,
}));

// ── /api/plates — public plate verification through gateway ──
app.use('/api/plates', createProxyMiddleware({
  target: process.env.PLATE_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  // No pathRewrite — plate-service mounts /api/plates/verify at the full path
  proxyTimeout: 10000,
  timeout: 10000,
}));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
});