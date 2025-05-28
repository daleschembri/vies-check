import React, { useState } from 'react';
import { Box, Paper, Button } from '@mui/material';
import DataTable from 'react-data-table-component';
import FileUpload from './FileUpload';
import VATInfoModal from './VATInfoModal';
import { validateVAT } from '../services/api';

const VATValidator = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [vatInfo, setVatInfo] = useState(null);

  const handleFileUpload = (vatNumbers) => {
    setData(vatNumbers.map(vat => ({ vat_number: vat })));
  };

  const handleValidateVAT = async (vatNumber) => {
    try {
      const response = await validateVAT(vatNumber);
      setVatInfo(response);
      setModalOpen(true);
    } catch (error) {
      console.error('Error validating VAT:', error);
      setVatInfo({ error: 'Failed to validate VAT number' });
      setModalOpen(true);
    }
  };

  const handleUpdateVAT = (oldVAT, newVAT) => {
    setData(data.map(item => 
      item.vat_number === oldVAT ? { ...item, vat_number: newVAT } : item
    ));
  };

  const columns = [
    {
      name: 'VAT Number',
      selector: row => row.vat_number,
      cell: row => (
        <input
          type="text"
          value={row.vat_number}
          onChange={(e) => handleUpdateVAT(row.vat_number, e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '100%'
          }}
        />
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleValidateVAT(row.vat_number)}
        >
          Get Address
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <FileUpload onUpload={handleFileUpload} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          responsive
        />
      </Paper>

      <VATInfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vatInfo={vatInfo}
      />
    </Box>
  );
};

export default VATValidator; 