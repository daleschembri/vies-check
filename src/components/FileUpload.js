import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const FileUpload = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data.length > 0 && results.data[0].includes('VAT NUM')) {
            const vatNumbers = results.data
              .slice(1) // Skip header row
              .map(row => row[0])
              .filter(vat => vat); // Remove empty rows
            onUpload(vatNumbers);
          } else {
            alert('CSV must contain a "VAT NUM" column');
          }
        },
        header: false,
      });
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #ccc',
        borderRadius: 2,
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <input {...getInputProps()} />
      <Typography variant="h6" gutterBottom>
        {isDragActive
          ? 'Drop the CSV file here'
          : 'Drag and drop a CSV file here, or click to select'}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        The CSV file must contain a "VAT NUM" column
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Select File
      </Button>
    </Box>
  );
};

export default FileUpload; 