import React, { useState, useEffect } from 'react';
import { Drawer, Box, TextField, Button, Autocomplete } from '@mui/material';
import supabase from '../supabaseClient.js';

const NewVehicleForm = ({ open, onClose, onVehicleAdded }) => {
  // Stan formularza
  const [formData, setFormData] = useState({
    vin: '',
    nr_rejestracyjny: '',
    producent: null,
    model: null,
    generacja: null,
    rok: '',
    przebieg: ''
  });

  // Stan list rozwijanych
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [generations, setGenerations] = useState([]);

  // Stan ładowania
  const [loading, setLoading] = useState({
    manufacturers: true,
    models: false,
    generations: false
  });

  // Pobieranie producentów przy pierwszym renderowaniu
  useEffect(() => {
    fetchManufacturers();
  }, []);

  // Pobieranie modeli gdy zmienia się producent
  useEffect(() => {
    if (formData.producent) {
      fetchModels(formData.producent);
      setFormData(prev => ({ ...prev, model: null, generacja: null }));
    } else {
      setModels([]);
      setGenerations([]);
    }
  }, [formData.producent]);

  // Pobieranie generacji gdy zmienia się model
  useEffect(() => {
    if (formData.model) {
      fetchGenerations(formData.producent, formData.model);
      setFormData(prev => ({ ...prev, generacja: null }));
    } else {
      setGenerations([]);
    }
  }, [formData.model]);

  // Funkcje pobierania danych
  const fetchManufacturers = async () => {
    try {
      const { data, error } = await supabase
        .from('producenci')
        .select('nazwa')
        .order('nazwa');

      if (error) throw error;
      setManufacturers(data.map(item => item.nazwa));
    } catch (error) {
      console.error('Błąd podczas pobierania producentów:', error);
    } finally {
      setLoading(prev => ({ ...prev, manufacturers: false }));
    }
  };

  const fetchModels = async (manufacturer) => {
    setLoading(prev => ({ ...prev, models: true }));
    try {
      const { data, error } = await supabase
        .from('modele')
        .select('nazwa')
        .eq('producent', manufacturer)
        .order('nazwa');

      if (error) throw error;
      setModels(data.map(item => item.nazwa));
    } catch (error) {
      console.error('Błąd podczas pobierania modeli:', error);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  const fetchGenerations = async (manufacturer, model) => {
    setLoading(prev => ({ ...prev, generations: true }));
    try {
      const { data, error } = await supabase
        .from('generacje')
        .select('nazwa')
        .eq('producent', manufacturer)
        .eq('model', model)
        .order('nazwa');

      if (error) throw error;
      setGenerations(data.map(item => item.nazwa));
    } catch (error) {
      console.error('Błąd podczas pobierania generacji:', error);
    } finally {
      setLoading(prev => ({ ...prev, generations: false }));
    }
  };

  // Obsługa submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('pojazdy')
        .insert([{
          vin: formData.vin,
          nr_rejestracyjny: formData.nr_rejestracyjny,
          producent: formData.producent,
          model: formData.model,
          generacja: formData.generacja || null,
          rok: parseInt(formData.rok),
          przebieg: parseFloat(formData.przebieg)
        }])
        .select('id');

      if (error) throw error;
      onVehicleAdded(data[0].id);
      onClose();
    } catch (error) {
      console.error('Błąd podczas dodawania pojazdu:', error);
    }
  };

  // Obsługa zmian w formularzu
  const handleChange = (field) => (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue || event.target.value
    }));
  };

  const handleVinChange = (event) => {
    const value = event.target.value.toUpperCase();
    if (value.length <= 17) {
      setFormData((prev) => ({
        ...prev,
        vin: value
      }));
    }
  };

  const handleRegistrationNumberChange = (event) => {
    const value = event.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      nr_rejestracyjny: value
    }));
  };



  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, padding: '20px' }}>
        <h2>Dodaj Pojazd</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="VIN"
            value={formData.vin}
            onChange={(event) => handleVinChange(event)}
            fullWidth
            margin="normal"
            error={formData.vin.length > 0 && formData.vin.length !== 17}
            helperText={
              formData.vin.length > 0 && formData.vin.length !== 17
                ? "VIN musi mieć dokładnie 17 znaków"
                : ""
            }
          />

          <TextField
            label="Nr rejestracyjny"
            value={formData.nr_rejestracyjny}
            onChange={(event) => handleRegistrationNumberChange(event)}
            fullWidth
            margin="normal"
          />

          <Autocomplete
            options={manufacturers}
            loading={loading.manufacturers}
            value={formData.producent}
            onChange={(event, newValue) => handleChange('producent')(event, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Producent"
                required
                margin="normal"
              />
            )}
          />
          <Autocomplete
            options={models}
            loading={loading.models}
            value={formData.model}
            disabled={!formData.producent}
            onChange={(event, newValue) => handleChange('model')(event, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Model"
                required
                margin="normal"
              />
            )}
          />
          <Autocomplete
            options={generations}
            loading={loading.generations}
            value={formData.generacja}
            disabled={!formData.model || generations.length === 0} // Dodano warunek dla pustej listy
            onChange={(event, newValue) => handleChange('generacja')(event, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Generacja"
                margin="normal"
              />
            )}
          />
          <TextField
            label="Rok"
            type="number"
            value={formData.rok}
            onChange={handleChange('rok')}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Przebieg (km)"
            type="number"
            value={formData.przebieg}
            onChange={handleChange('przebieg')}
            fullWidth
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