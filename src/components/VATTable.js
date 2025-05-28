import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Checkbox, Box } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import Papa from 'papaparse';

const VATTable = ({ data, onValidateSelected }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);

  const handleSelectAll = (state) => {
    if (state.selectedRows.length === 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data);
    }
  };

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleExportCSV = () => {
    const exportData = data.map(row => ({
      'VAT Number': row.vatNumber,
      'Company Name': row.name || '',
      'Address': row.address || '',
      'Valid': row.valid ? 'Yes' : 'No',
      'Error': row.error || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'vat_records.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      name: 'Select',
      cell: row => (
        <Checkbox
          checked={selectedRows.some(selected => selected.vatNumber === row.vatNumber)}
          onChange={() => {
            const newSelected = selectedRows.some(selected => selected.vatNumber === row.vatNumber)
              ? selectedRows.filter(selected => selected.vatNumber !== row.vatNumber)
              : [...selectedRows, row];
            setSelectedRows(newSelected);
          }}
        />
      ),
      width: '80px',
      sortable: false
    },
    {
      name: 'VAT Number',
      selector: row => row.vatNumber,
      sortable: true,
    },
    {
      name: 'Company Name',
      selector: row => row.name || '',
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address || '',
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        <Box>
          {row.valid ? (
            <span style={{ color: 'green' }}>Valid</span>
          ) : (
            <span style={{ color: 'red' }}>{row.error || 'Invalid'}</span>
          )}
        </Box>
      ),
      sortable: true,
    }
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onValidateSelected(selectedRows)}
          disabled={selectedRows.length === 0}
        >
          Fetch {selectedRows.length} Records
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={data.length === 0}
        >
          Export CSV
        </Button>
      </Box>
      <DataTable
        columns={columns}
        data={data}
        selectableRows
        selectableRowsComponent={Checkbox}
        selectableRowsComponentProps={{
          indeterminate: selectedRows.length > 0 && selectedRows.length < data.length
        }}
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleCleared}
        pagination
        highlightOnHover
        pointerOnHover
        dense
        selectableRowsHighlight
        selectableRowSelected={row => selectedRows.some(selected => selected.vatNumber === row.vatNumber)}
        onSelectAll={handleSelectAll}
      />
    </Box>
  );
};

export default VATTable; 