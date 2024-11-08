import React, { useState, useEffect } from 'react';
import NewClientForm from './NewClientForm';
import NewVehicleForm from './NewVehicleForm';
import NewServiceForm from './NewServiceForm';
import Tabs from './Tabs';
import { Autocomplete, TextField, Button, Box, IconButton, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import '../componentsCSS/OrderForm.css'
import supabase from '../supabaseClient.js';

const OrderForm = ({ onClose, fetchOrders, formData }) => {
  // Funkcja pomocnicza do formatowania daty
  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Jeśli data jest w formacie ISO, weź tylko część odpowiadającą za datę
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    // Jeśli data jest już w poprawnym formacie, zwróć ją bez zmian
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

  const [showAddKlientModal, setShowAddKlientModal] = useState(false);
  const [showAddPojazdModal, setShowAddPojazdModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Informacje ogólne');

  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // Dodano
  const [errorMessage, setErrorMessage] = useState('');


  // Funkcja do pobierania danych z Supabase
  const fetchData = async () => {
    try {
      // Pobranie danych z tabel klienci, pojazdy i uslugi
      const { data: klienci, error: error1 } = await supabase.from('klienci').select('*');
      const { data: pojazdy, error: error2 } = await supabase.from('pojazdy').select('*');
      const { data: uslugi, error: error3 } = await supabase.from('uslugi').select('*');
      if (error1 || error2 || error3) {
        throw new Error('Błąd podczas pobierania danych z Supabase');
      }

      setKlienci(klienci);
      setPojazdy(pojazdy);
      setUslugi(uslugi);
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

  useEffect(() => {
    fetchData();
  }, []);

  // Wstępna inicjalizacja stanu


  const fetchOrderServices = async (orderId) => {
    try {
      // Pobieramy dane z tabeli zlecenia_uslugi wraz z powiązanymi danymi z tabeli uslugi
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

      // Mapujemy dane do bardziej przyjaznej struktury
      const servicesWithDetails = orderServices.map(service => ({
        ...service,
        nazwa: service.uslugi.nazwa, // Dodajemy nazwę usługi z relacji
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
      // Pole zostało wyczyszczone
      setKlientId('');
    } else {
      // Ustawienie ID klienta
      setKlientId(value.id);
    }
  };

  const handlePojazdChange = (event, value) => {
    if (value === null) {
      // Pole zostało wyczyszczone
      setPojazdId('');
    } else {
      // Ustawienie ID pojazdu
      setPojazdId(value.id);
    }
  };

  const resetServiceForm = () => {
    setServiceQuantity(1);
  };

  const roundToTwoDecimals = (num) => {
    return Math.round(num * 100) / 100;
  };

  const calculateTotalPrice = (services) => {
    return services.reduce((sum, service) => sum + parseFloat(service.total), 0);
  };

  const formatAmount = (amount) => {
    if (!amount) return 0.00;

    try {
      const amountStr = amount.toString();

      // Sprawdzamy czy string zawiera przecinek
      let parsed;
      if (amountStr.includes(',')) {
        parsed = parseFloat(amountStr.replace(',', '.'));
      } else {
        parsed = parseFloat(amountStr);
      }

      // Sprawdzamy czy mamy prawidłową liczbę
      if (isNaN(parsed)) return 0.00;

      // Zaokrąglamy do 2 miejsc po przecinku i zwracamy jako liczbę
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

  const handleRowClickMobile = (index) => {
    setShowDeleteIcon((prev) => (prev === index ? null : index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (!klientId || !pojazdId || !uszkodzenia || !dataZlecenia) {
      setErrorMessage('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    try {
      const orderData = {
        klient_id: klientId,
        pojazd_id: pojazdId,
        uszkodzenia,
        data_zlecenia: dataZlecenia,
        cena: calculateTotalPrice(addedServices),
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
        tabs={['Informacje ogólne', 'Usługi']}
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
              getOptionLabel={(option) => `${option.imie} ${option.nazwisko} (${option.telefon})`}
              renderInput={(params) => (
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
                            <AddIcon />
                          </IconButton>
                        </InputAdornment>
                      </>
                    ),
                  }}
                />
              )}
              onChange={handleKlientChange}
              value={klienci.find((klient) => klient.id === klientId) || null}
            />

            {/* Pole Autocomplete dla pojazdu */}
            <Autocomplete
              className="formField"
              options={pojazdy}
              getOptionLabel={(option) => `${option.producent} ${option.model} (${option.vin || option.rejestracja})`}
              renderInput={(params) => (
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
                            <AddIcon />
                          </IconButton>
                        </InputAdornment>
                      </>
                    ),
                  }}
                />
              )}
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
                  error={!uszkodzenia && isFormSubmitted}
                  helperText={!uszkodzenia && isFormSubmitted ? 'Proszę opisać uszkodzenia' : ''}
                />
              </Box>

              {/* Data zlecenia Material UI */}
              <Box mb={3}>
                <TextField
                  label="Data zlecenia"
                  type="date"
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

          </>
        )}

        {activeTab === 'Usługi' && (
          <>
            <label>
              <Autocomplete
                className='formField'
                options={uslugi}
                getOptionLabel={(option) => `${option.nazwa} - ${option.cena} PLN`}
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
                              <AddIcon />
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
            <TableContainer component={Paper} style={{ height: 205, maxHeight: 250, overflowX: 'auto', }}>
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

            <h3 className='final-price'>
              Łączna cena: {calculateTotalPrice(addedServices).toFixed(2)} PLN
            </h3>
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
            fetchData(); // Odśwież dane pojazdów
          }}
          onClientAdded={(newClientId) => {
            setKlientId(newClientId);  // Ustaw nowo dodany pojazd jako wybrany
            setShowAddKlientModal(false);
            fetchData(); // Odśwież dane pojazdów
          }}
        />
      )}


      {/* Drawer do dodawania nowego pojazdu */}
      {showAddPojazdModal && (
        <NewVehicleForm
          open={showAddPojazdModal}
          onClose={() => {
            setShowAddPojazdModal(false);
            fetchData(); // Odśwież dane pojazdów
          }}
          onVehicleAdded={(newVehicleId) => {
            setPojazdId(newVehicleId);  // Ustaw nowo dodany pojazd jako wybrany
            setShowAddPojazdModal(false);
            fetchData(); // Odśwież dane pojazdów
          }}
        />
      )}


      {/* Drawer do dodawania nowej usługi */}
      {showAddServiceModal && (
        <NewServiceForm
          open={showAddServiceModal}
          onClose={() => {
            setShowAddServiceModal(false);
            fetchServices(); // Odświeżenie listy usług po dodaniu nowej
          }}
          onServiceAdded={(newServiceId) => {
            setShowAddServiceModal(false);
            fetchServices(); // Odśwież dane usług
          }}
        />
      )}


    </div>
  );
};

export default OrderForm; 