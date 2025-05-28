const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Set memory limits
const v8 = require('v8');
v8.setFlagsFromString('--max-old-space-size=256');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: ['https://vies-check.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Limit request body size

// Health check endpoint
app.get('/', (req, res) => {
  const heapStats = v8.getHeapStatistics();
  res.json({ 
    status: 'ok', 
    message: 'Proxy server is running',
    memory: {
      total: Math.round(heapStats.total_heap_size / 1024 / 1024) + 'MB',
      used: Math.round(heapStats.used_heap_size / 1024 / 1024) + 'MB',
      limit: Math.round(heapStats.heap_size_limit / 1024 / 1024) + 'MB'
    }
  });
});

// VAT validation endpoint
app.post('/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ error: 'VAT number is required' });
    }

    const countryCode = vatNumber.slice(0, 2);
    const vatNumberWithoutCountry = vatNumber.slice(2);

    const response = await axios.post('https://ec.europa.eu/taxation_customs/vies/rest/check-vat-number', {
      countryCode,
      vatNumber: vatNumberWithoutCountry
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000, // 5 second timeout
      maxContentLength: 1024 * 1024 // 1MB max response size
    });

    if (response.data.valid) {
      return res.json({
        valid: true,
        name: response.data.name || '',
        address: response.data.address || ''
      });
    } else {
      return res.json({
        valid: false,
        error: 'VAT Invalid'
      });
    }
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'VIES API Error',
        details: error.response.data
      });
    }

    return res.status(500).json({ 
      error: 'Failed to validate VAT number',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 