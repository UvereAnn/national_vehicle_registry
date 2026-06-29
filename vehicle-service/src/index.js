// vehicle-service/src/index.js
// All routes mounted at their FULL paths — no pathRewrite needed
// on the api-gateway side, same as auth-service.

require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const vehicleRoutes = require('./routes/vehicles');
const publicRoutes = require('./routes/public');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(express.json());

connectDB();

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'vehicle-service' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`vehicle-service running on port ${PORT}`);
});