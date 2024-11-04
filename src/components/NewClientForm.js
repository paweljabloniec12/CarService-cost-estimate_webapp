import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Drawer, Box } from '@mui/material';

const NewClientForm = ({open, onClose, onClientAdded }) => {
  const [imie, setImie] = useState('');
  const [nazwisko, setNazwisko] = useState('');
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/klienci', { imie, nazwisko, telefon, email });
      console.log('Response from API:', response);
      onClientAdded(response.data.id);
      onClose();
    } catch (error) {
      console.error('Błąd podczas dodawania klienta:', error);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
    <Box sx={{ width: 300, padding: '20px' }}>
      <h2>Dodaj Klienta</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Imię"
          value={imie}
          onChange={(e) => setImie(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Nazwisko"
          value={nazwisko}
          onChange={(e) => setNazwisko(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Telefon"
          type="tel"
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button type="submit" variant="contained" color="primary">
            Dodaj klienta
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

export default NewClientForm;
