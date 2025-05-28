import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { validateVAT } from '../services/api';
import VATTable from './VATTable';

const VATValidator = () => {
  const [vatNumber, setVatNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!vatNumber) {
      setError('Please enter a VAT number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await validateVAT(vatNumber);
      setRecords(prev => [...prev, { vatNumber, ...result }]);
      setVatNumber('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateSelected = async (selectedRows) => {
    setLoading(true);
    setError('');

    try {
      const updatedRecords = [...records];
      for (const row of selectedRows) {
        if (!row.valid) {
          const result = await validateVAT(row.vatNumber);
          const index = updatedRecords.findIndex(r => r.vatNumber === row.vatNumber);
          if (index !== -1) {
            updatedRecords[index] = { ...row, ...result };
          }
        }
      }
      setRecords(updatedRecords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        VAT Number Validator
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="VAT Number"
          value={vatNumber}
          onChange={(e) => setVatNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleValidate}
          disabled={loading || !vatNumber}
        >
          {loading ? <CircularProgress size={24} /> : 'Validate'}
        </Button>
      </Box>

      <VATTable 
        data={records} 
        onValidateSelected={handleValidateSelected}
      />
    </Box>
  );
};

export default VATValidator; 