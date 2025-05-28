const axios = require('axios');

const VIES_API_URL = 'https://ec.europa.eu/taxation_customs/vies/rest/check-vat-number';

export default async function handler(req, res) {
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

    const response = await axios.post(VIES_API_URL, {
      countryCode: vatNumber.slice(0, 2),
      vatNumber: vatNumber.slice(2)
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('VAT validation error:', error);
    return res.status(500).json({ 
      error: 'Failed to validate VAT number',
      details: error.message 
    });
  }
} 