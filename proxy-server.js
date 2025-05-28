const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// VAT validation endpoint
app.post('/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ error: 'VAT number is required' });
    }

    console.log('Validating VAT number:', vatNumber);

    const countryCode = vatNumber.slice(0, 2);
    const vatNumberWithoutCountry = vatNumber.slice(2);

    console.log('Making request to VIES API with:', {
      countryCode,
      vatNumber: vatNumberWithoutCountry
    });

    const response = await axios.post('https://ec.europa.eu/taxation_customs/vies/rest/check-vat-number', {
      countryCode,
      vatNumber: vatNumberWithoutCountry
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('VIES API response:', response.data);

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
    console.error('VAT validation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

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

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 