import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const VATInfoModal = ({ open, onClose, vatInfo }) => {
  if (!vatInfo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>VAT Information</DialogTitle>
      <DialogContent>
        {vatInfo.error ? (
          <Typography color="error">{vatInfo.error}</Typography>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Company Name:</strong>
            </Typography>
            <Typography paragraph>{vatInfo.name}</Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              <strong>Address:</strong>
            </Typography>
            <Typography>{vatInfo.address}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VATInfoModal; 