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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// VAT validation endpoint
app.post('/validate-vat', async (req, res) => {
  try {
    console.log('Received VAT validation request:', req.body);
    const { vatNumber } = req.body;

    if (!vatNumber) {
      return res.status(400).json({ error: 'VAT number is required' });
    }

    // Format VAT number (remove spaces and convert to uppercase)
    const formattedVat = vatNumber.replace(/\s/g, '').toUpperCase();
    console.log('Formatted VAT number:', formattedVat);

    // Extract country code and number
    const countryCode = formattedVat.substring(0, 2);
    const number = formattedVat.substring(2);

    console.log('Making request to VIES API:', { countryCode, number });

    const response = await axios.get('https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number', {
      params: {
        memberStateCode: countryCode,
        number: number
      },
      timeout: 5000
    });

    console.log('VIES API response:', response.data);

    if (response.data.valid) {
      res.json({
        valid: true,
        name: response.data.name || '',
        address: response.data.address || ''
      });
    } else {
      res.json({
        valid: false,
        error: 'Invalid VAT number'
      });
    }
  } catch (error) {
    console.error('Error validating VAT:', error.message);
    
    if (error.response) {
      console.error('VIES API error response:', error.response.data);
      res.status(error.response.status).json({
        error: 'Error from VIES API',
        details: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from VIES API');
      res.status(504).json({
        error: 'No response from VIES API',
        details: 'The request timed out or failed to reach the VIES API'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
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
  console.log('CORS enabled for:', corsOptions.origin);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 