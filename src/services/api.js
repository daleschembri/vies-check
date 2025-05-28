import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const validateVAT = async (vatNumber) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/validate_vat`, {
      vat_number: vatNumber
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to validate VAT number');
  }
};

export const updateVAT = async (oldVAT, newVAT) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/update_vat`, {
      old_vat: oldVAT,
      new_vat: newVAT
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update VAT number');
  }
}; 