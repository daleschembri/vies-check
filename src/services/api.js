import axios from 'axios';

const PROXY_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-proxy-server-url.onrender.com/validate-vat'  // Replace with your actual proxy server URL
  : 'http://localhost:3001/validate-vat';

export const validateVAT = async (vatNumber) => {
  try {
    const response = await axios.post(PROXY_URL, {
      vatNumber
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
      status: error.response?.status
    });

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.data?.details) {
      throw new Error(error.response.data.details);
    }
    throw new Error('Failed to validate VAT number');
  }
}; 