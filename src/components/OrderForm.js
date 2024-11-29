import React, { useState, useEffect } from 'react';
import NewClientForm from './NewClientForm';
import NewVehicleForm from './NewVehicleForm';
import NewServiceForm from './NewServiceForm';
import NewMaterialForm from './NewMaterialForm.js';
import { PDFGenerator } from './PDFGenerator';
import Tabs from './Tabs';
import { Autocomplete, TextField, Button, Box, IconButton, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import '../componentsCSS/OrderForm.css'
import supabase from '../supabaseClient.js';

const OrderForm = ({ onClose, fetchOrders, formData }) => {
  // Funkcja pomocnicza do formatowania daty
  const formatDate = (dateString) => {
    if (!dateString) return "";

    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    return dateString;
  };

  const [klientId, setKlientId] = useState(formData?.klienci?.id || '');
  const [pojazdId, setPojazdId] = useState(formData?.pojazdy?.id || '');
  const [uszkodzenia, setUszkodzenia] = useState(formData?.uszkodzenia || '');
  const [dataZlecenia, setDataZlecenia] = useState(formatDate(formData?.data_zlecenia) || "");
  const [addedServices, setAddedServices] = useState(formData?.uslugi || []);
  const [klienci, setKlienci] = useState([]);
  const [pojazdy, setPojazdy] = useState([]);
  const [uslugi, setUslugi] = useState([]);
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [materialQuantity, setMaterialQuantity] = useState(1);

  const [showAddKlientModal, setShowAddKlientModal] = useState(false);
  const [showAddPojazdModal, setShowAddPojazdModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Informacje ogólne');
  const [materialy, setMaterialy] = useState([]);
  const [addedMaterials, setAddedMaterials] = useState([]);

  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // Funkcja do pobierania danych z Supabase
  const fetchData = async () => {
    try {
      // Pobranie danych z tabel klienci, pojazdy, uslugi, materialy
      const { data: klienci, error: error1 } = await supabase.from('klienci').select('*');
      const { data: pojazdy, error: error2 } = await supabase.from('pojazdy').select('*');
      const { data: uslugi, error: error3 } = await supabase.from('uslugi').select('*');
      const { data: materialy, error: error4 } = await supabase.from('materialy').select('*');

      if (error1 || error2 || error3 || error4) {
        throw new Error('Błąd podczas pobierania danych z Supabase');
      }

      setKlienci(klienci);
      setPojazdy(pojazdy);
      setUslugi(uslugi);
      setMaterialy(materialy);
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
    }
  };

  // Funkcja do pobierania usług z Supabase
  const fetchServices = async () => {
    try {
      // Pobranie danych z tabeli uslugi
      const { data: uslugi, error } = await supabase.from('uslugi').select('*');

      if (error) {
        throw new Error('Błąd podczas pobierania usług z Supabase');
      }

      setUslugi(uslugi);
    } catch (error) {
      console.error('Błąd podczas pobierania usług:', error);
    }
  };

  // Funkcja do pobierania materialow z Supabase
  const fetchMaterials = async () => {
    try {
      // Pobranie danych z tabeli materialy
      const { data: materialy, error } = await supabase.from('materialy').select('*');


      if (error) {
        throw new Error('Błąd podczas pobierania materiałów z Supabase');
      }

      setMaterialy(materialy);
    } catch (error) {
      console.error('Błąd podczas pobierania materiałów:', error);
    }
  };

  const fetchOrderMaterials = async (orderId) => {
    try {
      const { data: orderMaterials, error } = await supabase
        .from('zlecenia_materialy')
        .select(`
            *,
            materialy:material_id (
              id,
              nazwa,
              jednostka
            )
          `)
        .eq('zlecenie_id', orderId);

      if (error) throw error;

      const materialsWithDetails = orderMaterials.map(material => ({
        ...material,
        nazwa: material.materialy.nazwa,
        nr_katalogowy: material.nr_katalogowy,
        jednostka: material.materialy.jednostka,
        quantity: material.ilosc,
        total: material.kwota,
      }));

      setAddedMaterials(materialsWithDetails);
    } catch (error) {
      console.error("Błąd podczas pobierania materiałów zlecenia:", error);
    }
  };

  useEffect(() => {
    if (formData?.id) {
      fetchOrderServices(formData.id);
      fetchOrderMaterials(formData.id);
    }
  }, [formData]);

  useEffect(() => {
    fetchData();
  }, []);


  const fetchOrderServices = async (orderId) => {
    try {
      const { data: orderServices, error } = await supabase
        .from('zlecenia_uslugi')
        .select(`
          *,
          uslugi:usluga_id (
            id,
            nazwa
          )
        `)
        .eq('zlecenie_id', orderId);

      if (error) throw error;

      // Mapowanie danych do bardziej przyjaznej struktury
      const servicesWithDetails = orderServices.map(service => ({
        ...service,
        nazwa: service.uslugi.nazwa,
        quantity: service.ilosc,
        total: service.kwota,
      }));

      setAddedServices(servicesWithDetails);
    } catch (error) {
      console.error("Błąd podczas pobierania usług zlecenia:", error);
    }
  };

  useEffect(() => {
    if (formData?.id) {
      fetchOrderServices(formData.id);
    }
  }, [formData]);


  const handleKlientChange = (event, value) => {
    if (value === null) {
      setKlientId('');
    } else {
      setKlientId(value.id);
    }
  };

  const handlePojazdChange = (event, value) => {
    if (value === null) {
      setPojazdId('');
    } else {
      setPojazdId(value.id);
    }
  };

  const resetServiceForm = () => {
    setServiceQuantity(1);
  };

  const resetMaterialForm = () => {
    setMaterialQuantity(1);
  };

  const roundToTwoDecimals = (num) => {
    return Math.round(num * 100) / 100;
  };

  const calculateTotalPrice = (services) => {
    return services.reduce((sum, service) => sum + parseFloat(service.total), 0);
  };

  const calculateTotalCombinedPrice = () => {
    const servicesTotal = calculateTotalPrice(addedServices);
    const materialsTotal = calculateTotalPrice(addedMaterials);
    return roundToTwoDecimals(servicesTotal + materialsTotal);
  };

  const formatAmount = (amount) => {
    if (!amount) return 0.00;

    try {
      const amountStr = amount.toString();
      let parsed;
      if (amountStr.includes(',')) {
        parsed = parseFloat(amountStr.replace(',', '.'));
      } else {
        parsed = parseFloat(amountStr);
      }

      if (isNaN(parsed)) return 0.00;

      return Number(parsed.toFixed(2));
    } catch (error) {
      console.error('Błąd podczas formatowania kwoty:', error);
      return 0.00;
    }
  };

  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = () => {
    setAddedServices(prev => prev.filter((_, i) => i !== deleteIndex));
    setOpenDialog(false);
    setDeleteIndex(null);
  };

  const handleDeleteMaterialConfirm = () => {
    setAddedMaterials(prev => prev.filter((_, i) => i !== deleteIndex));
    setOpenDialog(false);
    setDeleteIndex(null);
  };

  const handleRowClickMobile = (index) => {
    setShowDeleteIcon((prev) => (prev === index ? null : index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (!klientId || !pojazdId || !dataZlecenia) {
      setErrorMessage('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    try {
      const orderData = {
        klient_id: klientId,
        pojazd_id: pojazdId,
        uszkodzenia,
        data_zlecenia: dataZlecenia,
        cena: calculateTotalCombinedPrice(),
      };

      if (formData?.id) {
        // Aktualizacja istniejącego zlecenia
        const { error } = await supabase
          .from('zlecenia')
          .update(orderData)
          .eq('id', formData.id);

        if (error) {
          throw new Error('Błąd podczas aktualizacji zlecenia.');
        }

        // Aktualizacja usług zlecenia
        // Najpierw usuń wszystkie istniejące usługi
        await supabase
          .from('zlecenia_uslugi')
          .delete()
          .eq('zlecenie_id', formData.id);

        // Dodaj zaktualizowane usługi
        if (addedServices.length > 0) {
          const servicesData = addedServices.map((service) => ({
            zlecenie_id: formData.id,
            usluga_id: service.usluga_id || service.id,
            ilosc: service.quantity,
            kwota: formatAmount(service.total),
          }));

          const { error: insertError } = await supabase
            .from('zlecenia_uslugi')
            .insert(servicesData);

          if (insertError) {
            throw new Error('Błąd podczas aktualizacji usług zlecenia.');
          }
        }

        await supabase
          .from('zlecenia_materialy')
          .delete()
          .eq('zlecenie_id', formData.id);

        // Add updated materials
        if (addedMaterials.length > 0) {
          const materialsData = addedMaterials.map((material) => ({
            zlecenie_id: formData.id,
            material_id: material.material_id || material.id,
            nr_katalogowy: material.nr_katalogowy,
            ilosc: material.quantity,
            kwota: formatAmount(material.total),
          }));

          const { error: insertError } = await supabase
            .from('zlecenia_materialy')
            .insert(materialsData);

          if (insertError) {
            console.error('Detailed material insert error:', insertError);
            throw new Error('Błąd podczas aktualizacji materiałów zlecenia.');
          }
        }
      } else {
        // Tworzenie nowego zlecenia
        const { data, error } = await supabase
          .from('zlecenia')
          .insert(orderData)
          .select('id');

        if (error) {
          throw new Error('Błąd podczas utworzenia nowego zlecenia.');
        }

        const newOrderId = data[0].id;

        if (addedServices.length > 0) {
          const servicesData = addedServices.map((service) => ({
            zlecenie_id: newOrderId,
            usluga_id: service.id,
            ilosc: service.quantity,
            kwota: formatAmount(service.total),
          }));

          const { error: insertError } = await supabase
            .from('zlecenia_uslugi')
            .insert(servicesData);

          if (insertError) {
            throw new Error('Błąd podczas dodawania usług do nowego zlecenia.');
          }
        }

        if (addedMaterials.length > 0) {
          const materialsData = addedMaterials.map((material) => ({
            zlecenie_id: newOrderId,
            material_id: material.id,
            nr_katalogowy: material.nr_katalogowy,
            ilosc: material.quantity,
            kwota: formatAmount(material.total),
          }));

          const { error: insertError } = await supabase
            .from('zlecenia_materialy')
            .insert(materialsData);

          if (insertError) {
            throw new Error('Błąd podczas dodawania materiałów do nowego zlecenia.');
          }
        }
      }

      setErrorMessage('');
      await fetchOrders();
      onClose();
    } catch (error) {
      console.error('Błąd podczas zapisywania zlecenia:', error);
      setErrorMessage('Wystąpił błąd podczas zapisywania zlecenia.');
    }
  };

  return (
    <div>
      <h2>{formData?.id ? `Edycja zlecenia #${formData.id}` : 'Nowe zlecenie'}</h2>

      {/* Zakładki */}
      <Tabs
        tabs={['Informacje ogólne', 'Usługi', 'Materiały']}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <form onSubmit={handleSubmit} className="order-form">
        {activeTab === 'Informacje ogólne' && (
          <>
            {/* Walidacja stanu */}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {/* Pole Autocomplete dla klienta */}
            <Autocomplete
              className="formField"
              options={klienci}
              getOptionLabel={(option) => ""}
              filterOptions={(options, { inputValue }) => {
                const searchValue = inputValue.toLowerCase();
                return options.filter(option =>
                  option.imie.toLowerCase().includes(searchValue) ||
                  option.nazwisko.toLowerCase().includes(searchValue) ||
                  option.telefon.includes(searchValue)
                );
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <strong>{option.imie} {option.nazwisko}</strong>
                    <span>Tel: {option.telefon}</span>
                  </div>
                </li>
              )}
              renderInput={(params) => {
                const selectedClient = klienci.find((klient) => klient.id === klientId);
                return (
                  <TextField
                    {...params}
                    label="Klient"
                    variant="outlined"
                    error={!klientId && isFormSubmitted}
                    helperText={!klientId && isFormSubmitted ? 'Proszę wybrać klienta' : ''}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowAddKlientModal(true)}>
                              <AddCircleIcon sx={{ color: '#d5641a' }} />
                            </IconButton>
                          </InputAdornment>
                        </>
                      ),
                      startAdornment: selectedClient ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <strong>{selectedClient.imie} {selectedClient.nazwisko}</strong>
                          <span>Tel: {selectedClient.telefon}</span>
                        </div>
                      ) : null,
                    }}
                  />
                );
              }}
              onChange={handleKlientChange}
              value={klienci.find((klient) => klient.id === klientId) || null}
            />

            {/* Pole Autocomplete dla pojazdu */}
            <Autocomplete
              className="formField"
              options={pojazdy}
              getOptionLabel={(option) => ""}
              filterOptions={(options, { inputValue }) => {
                const searchValue = inputValue.toLowerCase();
                return options.filter(option =>
                  option.producent.toLowerCase().includes(searchValue) ||
                  option.model.toLowerCase().includes(searchValue) ||
                  (option.vin && option.vin.toLowerCase().includes(searchValue)) ||
                  (option.nr_rejestracyjny && option.nr_rejestracyjny.toLowerCase().includes(searchValue))
                );
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <strong>{option.producent} {option.model}</strong>
                    {option.nr_rejestracyjny && <span>({option.nr_rejestracyjny})</span>}
                    {option.vin && <span style={{ color: '#2196f3' }}>VIN: {option.vin}</span>}
                  </div>
                </li>
              )}

              renderInput={(params) => {
                const selectedVehicle = pojazdy.find((pojazd) => pojazd.id === pojazdId);
                return (
                  <TextField
                    {...params}
                    label="Pojazd"
                    variant="outlined"
                    error={!pojazdId && isFormSubmitted}
                    helperText={!pojazdId && isFormSubmitted ? 'Proszę wybrać pojazd' : ''}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowAddPojazdModal(true)}>
                              <AddCircleIcon sx={{ color: '#d5641a' }} />
                            </IconButton>
                          </InputAdornment>
                        </>
                      ),
                      startAdornment: selectedVehicle ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <strong>{selectedVehicle.producent} {selectedVehicle.model}</strong>
                          {selectedVehicle.nr_rejestracyjny && <span>({selectedVehicle.nr_rejestracyjny})</span>}
                          {selectedVehicle.vin && <span style={{ color: '#2196f3' }}>VIN: {selectedVehicle.vin}</span>}
                        </div>
                      ) : null,
                    }}
                  />
                );
              }}
              onChange={handlePojazdChange}
              value={pojazdy.find((pojazd) => pojazd.id === pojazdId) || null}
            />

            <>
              {/* Pole tekstowe Material UI dla uszkodzeń */}
              <Box mb={3}>
                <TextField
                  label="Uszkodzenia"
                  multiline
                  rows={2}
                  value={uszkodzenia}
                  onChange={(e) => setUszkodzenia(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Box>

              {/* Data zlecenia Material UI */}
              <Box mb={3}>
                <TextField
                  label="Data zlecenia"
                  type="date"
                  sx={{ marginBottom: '15.5rem' }}
                  value={dataZlecenia}
                  onChange={(e) => setDataZlecenia(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  error={!dataZlecenia && isFormSubmitted}
                  helperText={!dataZlecenia && isFormSubmitted ? 'Proszę wybrać datę zlecenia' : ''}
                />
              </Box>
            </>

            <PDFGenerator
              klient={klienci.find((k) => k.id === klientId)}
              pojazd={pojazdy.find((p) => p.id === pojazdId)}
              addedServices={addedServices}
              addedMaterials={addedMaterials}
              calculateTotalPrice={calculateTotalPrice}
            />
          </>
        )}

        {activeTab === 'Usługi' && (
          <>
            <label>
              <Autocomplete
                className='formField'
                options={uslugi}
                getOptionLabel={(option) => `${option.nazwa}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Wybierz usługę"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowAddServiceModal(true)}>
                              <AddCircleIcon sx={{ color: '#d5641a' }} />
                            </IconButton>
                          </InputAdornment>
                        </>
                      ),
                    }}
                  />
                )}
                onChange={(event, value) => {
                  if (value) {
                    const total = value.cena * serviceQuantity;
                    setAddedServices(prev => [...prev, {
                      ...value,
                      quantity: serviceQuantity,
                      total: roundToTwoDecimals(total)
                    }]);
                    resetServiceForm();
                  }
                }}
                value={null}
              />
            </label>

            {/* Tabela do wyświetlania dodanych usług */}
            <TableContainer component={Paper} style={{ height: 441, maxHeight: 500, overflowX: 'auto' }}>
              <Table stickyHeader aria-label="services table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '35%', minWidth: 80 }}>Nazwa</TableCell>
                    <TableCell style={{ width: '20%', textAlign: 'center', minWidth: 60 }}>Cena</TableCell>
                    <TableCell style={{ width: '15%', textAlign: 'center', minWidth: 50 }}>Ilość</TableCell>
                    <TableCell style={{ width: '25%', textAlign: 'center', minWidth: 70 }}>Kwota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addedServices.map((service, index) => (
                    <TableRow
                      key={index}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      onClick={() => isMobile && handleRowClickMobile(index)}
                    >
                      <TableCell sx={{ fontSize: '1rem' }}>{service.nazwa}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          inputProps={{ step: "0.01" }}
                          value={roundToTwoDecimals(service.total / service.quantity)}
                          onChange={(e) => {
                            let newPrice = parseFloat(e.target.value);
                            if (isNaN(newPrice)) newPrice = 0;
                            const newTotal = roundToTwoDecimals(newPrice * service.quantity);
                            setAddedServices(prev =>
                              prev.map((s, i) =>
                                i === index ? { ...s, cena: newPrice, total: newTotal } : s
                              )
                            );
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={service.quantity}
                          onChange={(e) => {
                            let newQuantity = parseInt(e.target.value);
                            if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
                            const newTotal = roundToTwoDecimals((service.total / service.quantity) * newQuantity);
                            setAddedServices(prev =>
                              prev.map((s, i) =>
                                i === index ? { ...s, quantity: newQuantity, total: newTotal } : s
                              )
                            );
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>
                        {roundToTwoDecimals(service.total)} PLN
                        {(hoveredRowIndex === index || showDeleteIcon === index) && (
                          <IconButton
                            onClick={() => handleDeleteClick(index)}
                            style={{ marginLeft: 8, color: "red" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Okno dialogowe do potwierdzenia usunięcia */}
              <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
              >
                <DialogTitle>Potwierdź usunięcie</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Czy na pewno chcesz usunąć tę usługę z tabeli?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenDialog(false)} color="primary">
                    Anuluj
                  </Button>
                  <Button onClick={handleDeleteConfirm} color="secondary">
                    Usuń
                  </Button>
                </DialogActions>
              </Dialog>
            </TableContainer>

            <h3 className='final-price-normal'>
              Cena usług: {calculateTotalPrice(addedServices).toFixed(2)} PLN
            </h3>
            <h3 className='final-price'>
              Łączna kwota: {calculateTotalCombinedPrice()} PLN
            </h3>
            <PDFGenerator
              klient={klienci.find((k) => k.id === klientId)}
              pojazd={pojazdy.find((p) => p.id === pojazdId)}
              addedServices={addedServices}
              addedMaterials={addedMaterials}
              calculateTotalPrice={calculateTotalPrice}
            />
          </>
        )}

        {activeTab === 'Materiały' && (
          <>
            <label>
              <Autocomplete
                className='formField'
                options={materialy}
                getOptionLabel={(option) => `${option.nazwa}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Wybierz materiał"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowAddMaterialModal(true)}>
                              <AddCircleIcon sx={{ color: '#d5641a' }} />
                            </IconButton>
                          </InputAdornment>
                        </>
                      ),
                    }}
                  />
                )}
                onChange={(event, value) => {
                  if (value) {
                    const total = value.cena * materialQuantity;
                    setAddedMaterials(prev => [...prev, {
                      ...value,
                      quantity: materialQuantity,
                      total: roundToTwoDecimals(total)
                    }]);
                    resetMaterialForm();
                  }
                }}
                value={null}
              />
            </label>

            <TableContainer component={Paper} style={{ height: 441, maxHeight: 500, overflowX: 'auto' }}>
              <Table stickyHeader aria-label="materials table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '35%', minWidth: 80 }}>Nazwa</TableCell>
                    <TableCell style={{ width: '20%', textAlign: 'center', minWidth: 60 }}>Cena</TableCell>
                    <TableCell style={{ width: '15%', textAlign: 'center', minWidth: 50 }}>Ilość</TableCell>
                    <TableCell style={{ width: '25%', textAlign: 'center', minWidth: 70 }}>Kwota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addedMaterials.map((material, index) => (
                    <TableRow
                      key={index}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      onClick={() => isMobile && handleRowClickMobile(index)}
                    >
                      <TableCell
                        sx={{
                          fontSize: '1rem',
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '200px'
                        }}
                      > {material.nazwa}
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Nr. kat."
                          value={material.nr_katalogowy || ''}
                          onChange={(e) => {
                            const newCatalogNumber = e.target.value;
                            setAddedMaterials(prev =>
                              prev.map((m, i) =>
                                i === index ? { ...m, nr_katalogowy: newCatalogNumber } : m
                              )
                            );
                          }}
                          margin="dense"
                          style={{ marginTop: 8 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          inputProps={{ step: "0.01" }}
                          value={roundToTwoDecimals(material.total / material.quantity)}
                          onChange={(e) => {
                            let newPrice = parseFloat(e.target.value);
                            if (isNaN(newPrice)) newPrice = 0;
                            const newTotal = roundToTwoDecimals(newPrice * material.quantity);
                            setAddedMaterials(prev =>
                              prev.map((m, i) =>
                                i === index ? { ...m, cena: newPrice, total: newTotal } : m
                              )
                            );
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TextField
                            type="text"
                            value={material.jednostka === 'L'
                              ? material.quantity.toString().replace('.', ',')
                              : material.quantity}
                            onChange={(e) => {
                              const inputValue = e.target.value.replace(',', '.');
                              let newQuantity = material.jednostka === 'L'
                                ? parseFloat(inputValue)
                                : parseInt(inputValue);

                              if (material.jednostka === 'L') {
                                if (isNaN(newQuantity) || newQuantity < 0) newQuantity = 0;
                              } else {
                                if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
                              }

                              const newTotal = roundToTwoDecimals((material.total / material.quantity) * newQuantity);
                              setAddedMaterials(prev =>
                                prev.map((m, i) =>
                                  i === index ? { ...m, quantity: newQuantity, total: newTotal } : m
                                )
                              );
                            }}
                            variant="outlined"
                            size="small"
                            style={{ width: '100px' }}
                            inputProps={{
                              pattern: material.jednostka === 'L' ? "[0-9]+([,][0-9]+)?" : undefined
                            }}
                          />
                          <span>{material.jednostka || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>
                        {roundToTwoDecimals(material.total)} PLN
                        {(hoveredRowIndex === index || showDeleteIcon === index) && (
                          <IconButton
                            onClick={() => handleDeleteClick(index)}
                            style={{ marginLeft: 8, color: "red" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
              >
                <DialogTitle>Potwierdź usunięcie</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Czy na pewno chcesz usunąć ten materiał z tabeli?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenDialog(false)} color="primary">
                    Anuluj
                  </Button>
                  <Button onClick={handleDeleteMaterialConfirm} color="secondary">
                    Usuń
                  </Button>
                </DialogActions>
              </Dialog>
            </TableContainer>

            <h3 className='final-price-normal'>
              Cena materiałów: {calculateTotalPrice(addedMaterials).toFixed(2)} PLN
            </h3>
            <h3 className='final-price'>
              Łączna kwota: {calculateTotalCombinedPrice()} PLN
            </h3>

            <PDFGenerator
              klient={klienci.find((k) => k.id === klientId)}
              pojazd={pojazdy.find((p) => p.id === pojazdId)}
              addedServices={addedServices}
              addedMaterials={addedMaterials}
              calculateTotalPrice={calculateTotalPrice}
            />
          </>
        )}


        <Button type="submit" variant="contained" color="primary">
          Zapisz zlecenie
        </Button>
      </form>

      {/* Drawer do dodawania nowego klienta */}
      {showAddKlientModal && (
        <NewClientForm
          open={showAddKlientModal}
          onClose={() => {
            setShowAddKlientModal(false);
            fetchData();
          }}
          onClientAdded={(newClientId) => {
            setKlientId(newClientId);
            setShowAddKlientModal(false);
            fetchData();
          }}
        />
      )}

      {/* Drawer do dodawania nowego pojazdu */}
      {showAddPojazdModal && (
        <NewVehicleForm
          open={showAddPojazdModal}
          onClose={() => {
            setShowAddPojazdModal(false);
            fetchData();
          }}
          onVehicleAdded={(newVehicleId) => {
            setPojazdId(newVehicleId);
            setShowAddPojazdModal(false);
            fetchData();
          }}
        />
      )}

      {/* Drawer do dodawania nowej usługi */}
      {showAddServiceModal && (
        <NewServiceForm
          open={showAddServiceModal}
          onClose={() => {
            setShowAddServiceModal(false);
            fetchServices();
          }}
          onServiceAdded={(newServiceId) => {
            setShowAddServiceModal(false);
            fetchServices();
          }}
        />
      )}

      {showAddMaterialModal && (
        <NewMaterialForm
          open={showAddMaterialModal}
          onClose={() => {
            setShowAddMaterialModal(false);
            fetchMaterials();
          }}
          onMaterialAdded={(newMaterialId) => {
            setShowAddMaterialModal(false);
            fetchMaterials();
          }}
        />
      )}
    </div>
  );
};

export default OrderForm; 