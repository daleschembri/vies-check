import axios from 'axios';

// Determine if we're in production based on the URL
const isProduction = window.location.hostname !== 'localhost';

// VATLayer API configuration
const VATLAYER_API_KEY = '2f5f0b8c606269e043e85f1e449a302a';
const VATLAYER_BASE_URL = 'https://apilayer.net/api/validate';

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using VATLayer API:', VATLAYER_BASE_URL);

export const validateVAT = async (vatNumber) => {
  try {
    console.log('Validating VAT number:', vatNumber);

    const response = await axios.get(VATLAYER_BASE_URL, {
      params: {
        access_key: VATLAYER_API_KEY,
        vat_number: vatNumber
      },
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('VATLayer response:', response.data);

    if (response.data.valid) {
      return {
        valid: true,
        name: response.data.company_name || '',
        address: response.data.company_address || '',
        country: response.data.country_code || '',
        vatNumber: response.data.vat_number || vatNumber
      };
    } else {
      return {
        valid: false,
        error: response.data.error?.info || 'Invalid VAT number'
      };
    }
  } catch (error) {
    console.error('VAT validation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.info || 'API Error');
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