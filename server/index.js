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

    const response = await axios.post('https://ec.europa.eu/taxation_customs/vies/rest/check-vat-number', {
      countryCode: vatNumber.slice(0, 2),
      vatNumber: vatNumber.slice(2)
    });

    return res.json(response.data);
  } catch (error) {
    console.error('VAT validation error:', error);
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