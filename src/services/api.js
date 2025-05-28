import axios from 'axios';

const VIES_API_URL = 'https://ec.europa.eu/taxation_customs/vies/rest/check-vat-number';

export const validateVAT = async (vatNumber) => {
  try {
    const response = await axios.post(VIES_API_URL, {
      countryCode: vatNumber.slice(0, 2),
      vatNumber: vatNumber.slice(2)
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
    throw new Error('Failed to validate VAT number');
  }
}; 