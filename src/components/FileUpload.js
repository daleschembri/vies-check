import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import Papa from 'papaparse';

const FileUpload = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          // Extract VAT numbers from CSV
          const vatNumbers = results.data
            .map(row => row[0]) // Assuming VAT numbers are in the first column
            .filter(vat => vat && vat.trim() !== ''); // Remove empty rows
          
          onUpload(vatNumbers);
        },
        header: false,
        skipEmptyLines: true
      });
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h6" align="center">
          {isDragActive
            ? 'Drop the CSV file here'
            : 'Drag and drop a CSV file here, or click to select'}
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          The CSV file should contain VAT numbers in the first column
        </Typography>
      </Box>
    </Paper>
  );
};

export default FileUpload; 