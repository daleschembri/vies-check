import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/validate-vat'
  : 'http://localhost:3001/api/validate-vat';

export const validateVAT = async (vatNumber) => {
  try {
    const response = await axios.post(API_URL, {
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