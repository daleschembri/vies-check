const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// API endpoint for VAT validation
app.post('/api/validate-vat', async (req, res) => {
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

    // If the VIES API returns an error, forward it to the client
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 