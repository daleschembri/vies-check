import axios from 'axios';

const API_URL = '/api/validate-vat';

export const validateVAT = async (vatNumber) => {
  try {
    const response = await axios.post(API_URL, {
      vatNumber
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
        error: 'VAT Invalid'
      };
    }
  } catch (error) {
    console.error('VAT validation error:', error);
    throw new Error(error.response?.data?.error || 'Failed to validate VAT number');
  }
}; 