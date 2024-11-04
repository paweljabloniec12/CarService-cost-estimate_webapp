import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Drawer, Box } from '@mui/material';

const NewVehicleForm = ({ open, onClose, onVehicleAdded }) => {
  const [vin, setVin] = useState('');
  const [nr_rejestracyjny, setNrRejestracyjny] = useState('');
  const [producent, setProducent] = useState('');
  const [model, setModel] = useState('');
  const [generacja, setGeneracja] = useState('');
  const [rok, setRok] = useState('');
  const [przebieg, setPrzebieg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/pojazdy', {
        vin,
        nr_rejestracyjny,
        producent,
        model,
        generacja,
        rok,
        przebieg,
      });
      onVehicleAdded(response.data.id);
      onClose();
    } catch (error) {
      console.error('Błąd podczas dodawania pojazdu:', error);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, padding: '20px' }}>
        <h2>Dodaj Pojazd</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Nr rejestracyjny"
            value={nr_rejestracyjny}
            onChange={(e) => setNrRejestracyjny(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Producent"
            value={producent}
            onChange={(e) => setProducent(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Generacja"
            value={generacja}
            onChange={(e) => setGeneracja(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Rok"
            type="number"
            value={rok}
            onChange={(e) => setRok(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Przebieg (km)"
            type="number"
            value={przebieg}
            onChange={(e) => setPrzebieg(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <Button type="submit" variant="contained" color="primary">
              Dodaj pojazd
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

export default NewVehicleForm;
