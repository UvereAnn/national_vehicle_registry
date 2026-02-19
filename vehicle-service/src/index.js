require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const vehicleRoutes = require('./routes/vehicles');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'vehicle-service' }));
app.use('/vehicles', vehicleRoutes);
app.use('/public', publicRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`Vehicle Service running on port ${PORT}`));
module.exports = app;
