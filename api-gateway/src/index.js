require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nvr_secret_key_2024';

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

try {
  const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (e) { console.log('Swagger file not found'); }

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date() }));

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

// Manually forward user headers BEFORE proxying
const withUserHeaders = (req, res, next) => {
  if (req.user) {
    req.headers['x-user-id'] = String(req.user.id);
    req.headers['x-user-role'] = String(req.user.role);
    req.headers['x-user-name'] = String(req.user.name || '');
    console.log('[Gateway] Set headers - id:' + req.user.id + ' role:' + req.user.role);
  }
  next();
};

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  proxyTimeout: 10000,
  timeout: 10000
}));

app.use('/api/public', createProxyMiddleware({
  target: process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/public': '/public' },
  proxyTimeout: 10000,
  timeout: 10000
}));

app.use('/api/vehicles', verifyToken, withUserHeaders, createProxyMiddleware({
  target: process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/vehicles': '/vehicles' },
  proxyTimeout: 10000,
  timeout: 10000
}));

app.use('/api/plates', verifyToken, withUserHeaders, createProxyMiddleware({
  target: process.env.PLATE_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/plates': '/plates' },
  proxyTimeout: 10000,
  timeout: 10000
}));

app.use('/api/admin', verifyToken, withUserHeaders, createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/admin': '/admin' },
  proxyTimeout: 10000,
  timeout: 10000
}));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => console.log('API Gateway running on port ' + PORT));
module.exports = app;
