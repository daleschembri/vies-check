import axios from 'axios';

// Determine if we're in production based on the URL
const isProduction = window.location.hostname !== 'localhost';
const PROXY_URL = isProduction
  ? 'https://vat-validator-proxy.onrender.com/validate-vat'
  : 'http://localhost:3001/validate-vat';

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using proxy URL:', PROXY_URL);

export const validateVAT = async (vatNumber) => {
  try {
    console.log('Validating VAT number:', vatNumber);

    const response = await axios.post(PROXY_URL, {
      vatNumber
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('Proxy response:', response.data);

    if (response.data.valid) {
      return {
        valid: true,
        name: response.data.name || '',
        address: response.data.address || ''
      };
    } else {
      return {
        valid: false,
        error: response.data.error || 'VAT Invalid'
      };
    }
  } catch (error) {
    console.error('VAT validation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: PROXY_URL
    });

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.data?.details) {
      throw new Error(error.response.data.details);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error('Failed to validate VAT number');
  }
}; 