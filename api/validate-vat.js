const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}; 