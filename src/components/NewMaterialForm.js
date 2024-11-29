import React, { useState } from 'react';
import { Drawer, Box, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import supabase from '../supabaseClient.js';

const NewMaterialForm = ({ open, onClose, onMaterialAdded }) => {
    const [nazwa, setNazwa] = useState('');
    const [jednostka, setJednostka] = useState('');
    const [cena, setCena] = useState('0');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const priceValue = parseFloat(cena);
        if (isNaN(priceValue)) {
            console.error('Nieprawidłowa cena');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('materialy')
                .insert([{
                    nazwa,
                    jednostka,
                    cena: priceValue
                }])
                .select('id');

            if (error) {
                console.error('Błąd podczas dodawania materiału:', error);
            } else {
                onMaterialAdded(data[0].id);
                onClose();
            }
        } catch (error) {
            console.error('Błąd podczas dodawania materiału:', error);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 300, padding: '20px' }}>
                <h2>Dodaj Materiał</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Nazwa materiału"
                        value={nazwa}
                        onChange={(e) => setNazwa(e.target.value)}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Jednostka</InputLabel>
                        <Select
                            value={jednostka}
                            label="Jednostka"
                            onChange={(e) => setJednostka(e.target.value)}
                        >
                            <MenuItem value="szt">Sztuka (szt)</MenuItem>
                            <MenuItem value="opak">Opakowanie (opak)</MenuItem>
                            <MenuItem value="kpl">Komplet (kpl)</MenuItem>
                            <MenuItem value="L">Litr (L)</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Cena (PLN)"
                        type="number"
                        value={cena}
                        onChange={(e) => setCena(e.target.value)}
                        fullWidth
                        margin="normal"
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                    <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <Button type="submit" variant="contained" color="primary">
                            Dodaj materiał
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

export default NewMaterialForm;