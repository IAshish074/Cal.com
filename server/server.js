require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// ✅ Clean CORS setup
app.use(cors({
  origin: true, // allow all origins (or replace with your frontend URL)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight handler
app.options(/.*/, cors());

app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    const initDB = require('./scripts/initDB');
    await initDB();
    console.log('Automated Database Sync check completed.');
  } catch (error) {
    console.error('Failed to auto-sync Aiven database schemas:', error);
  }
});