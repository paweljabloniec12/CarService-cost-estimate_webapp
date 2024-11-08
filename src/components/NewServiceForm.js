import React, { useState } from 'react';
import { Drawer, Box, TextField, Button } from '@mui/material';
import supabase from '../supabaseClient.js';

const NewServiceForm = ({ open, onClose, onServiceAdded }) => {
  const [nazwa, setNazwa] = useState('');
  const [cena, setCena] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('uslugi')
        .insert([{ nazwa, cena: parseFloat(cena) }])
        .select('id');

      if (error) {
        console.error('Błąd podczas dodawania usługi:', error);
      } else {
        onServiceAdded(data.id);
        onClose();
      }
    } catch (error) {
      console.error('Błąd podczas dodawania usługi:', error);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, padding: '20px' }}>
        <h2>Dodaj Usługę</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nazwa usługi"
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Cena (PLN)"
            type="number"
            value={cena}
            onChange={(e) => setCena(e.target.value)}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <Button type="submit" variant="contained" color="primary">
              Dodaj usługę
            </Button>
            <Button onClick={onClose} variant="outlined" color="secondary">
              Anuluj
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default NewServiceForm;