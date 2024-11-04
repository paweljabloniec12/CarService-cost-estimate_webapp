import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm';
import Modal from './Modal'; // Importuj komponent Modal
import '../componentsCSS/OrdersTable.css'; // Nowy plik CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Button,
  TextField,
} from '@mui/material';

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({});
  const [hoveredRowId, setHoveredRowId] = useState(null); // Stan dla przechowywania ID aktualnie najedzionej komórki





  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/zlecenia');
      setOrders(response.data);
      setSelectedOrders([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Błąd podczas pobierania zleceń:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (id) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((orderId) => orderId !== id)
        : [...prevSelected, id]
    );
  };

  const handleOrderClick = async (orderId) => {
    try {
      // Pobierz szczegółowe dane zlecenia
      const orderResponse = await axios.get(`/api/zlecenia/${orderId}`);

      // Przygotuj dane do edycji
      const orderData = {
        ...orderResponse.data,
        uslugi: [] // Domyślnie ustaw puste usługi
      };

      try {
        // Spróbuj pobrać usługi zlecenia
        const servicesResponse = await axios.get(`/api/zlecenia/${orderId}/uslugi`);
        orderData.uslugi = servicesResponse.data; // Ustaw usługi, jeśli są dostępne
      } catch (error) {
        // Jeśli nie ma usług, logujemy błąd, ale kontynuujemy
        console.warn('Brak usług dla tego zlecenia:', error.message);
      }

      setFormData(orderData); // Przekaż dane do formularza
      setShowForm(true); // Otwórz formularz
    } catch (error) {
      console.error('Błąd podczas pobierania danych zlecenia:', error);
    }
  };


  useEffect(() => {
    if (orders.length === 0) {
      setSelectAll(false);
    } else {
      setSelectAll(selectedOrders.length === orders.length);
    }
  }, [selectedOrders, orders]);


  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.zlecenie_id));
    }
    setSelectAll(!selectAll);
  };

  const deleteSelectedOrders = async () => {
    try {
      await Promise.all(
        selectedOrders.map((orderId) => axios.delete(`/api/zlecenia/${orderId}`))
      );
      fetchOrders();
    } catch (error) {
      console.error('Błąd podczas usuwania zleceń:', error);
    }
  };

  const toggleForm = (resetForm = false) => {
    if (resetForm) {
      setFormData({});        // Resetowanie danych formularza
    }
    setShowForm(!showForm);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // Funkcja do filtrowania zleceń na podstawie imienia i nazwiska klienta
  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.imie} ${order.nazwisko}`.toLowerCase();
    const registrationNumber = order.nr_rejestracyjny?.toLowerCase() || ''; // Zabezpieczenie przed brakiem nr rejestracyjnego
    return fullName.includes(searchQuery.toLowerCase()) || registrationNumber.includes(searchQuery.toLowerCase());
  });


  return (
    <div className="container">
      <div className="button-container">
        <Button variant="contained" onClick={() => setShowForm(true)}>
          DODAJ ZLECENIE
        </Button>

        {selectedOrders.length > 0 && (
          <Button variant="contained" color="error" onClick={deleteSelectedOrders}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        )}
      </div>

      <div className="search-container">
        <div className="search-field">
          {/* Pole tekstowe do wyszukiwania */}
          <TextField
            label="Wyszukaj klienta/nr rej"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            disabled={orders.length === 0}
          />
        </div>
      </div>



      {showForm && (
        <Modal isOpen={showForm} onClose={toggleForm}>
          <OrderForm onClose={toggleForm} fetchOrders={fetchOrders} formData={formData} setFormData={setFormData} />
        </Modal>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead style={{backgroundColor: "#f5f5f5"}}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell style={{ width: "10%" }}>Zlecenie #</TableCell>
              <TableCell>Pojazd</TableCell>
              <TableCell>Uszkodzenie</TableCell>
              <TableCell>Klient</TableCell>
              <TableCell style={{textAlign: "center"}}>Cena</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .sort((a, b) => b.zlecenie_id - a.zlecenie_id) // Sortowanie od największego do najmniejszego
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.zlecenie_id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.zlecenie_id)}
                      onChange={() => handleSelectOrder(order.zlecenie_id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => handleOrderClick(order.zlecenie_id)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      backgroundColor: hoveredRowId === order.zlecenie_id ? '#f0f0f0' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredRowId(order.zlecenie_id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    {order.zlecenie_id}
                  </TableCell>

                  <TableCell>
                    <strong>{order.producent} {order.model}</strong>
                    <br />
                    {order.nr_rejestracyjny || ''}
                  </TableCell>

                  <TableCell>{order.uszkodzenia}</TableCell>

                  <TableCell>
                    <strong>{order.imie} {order.nazwisko}</strong>
                    <br />
                    <a
                      href={`tel:+48${order.telefon}`}
                      style={{
                        color: '#2196f3',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '4px'
                      }}
                    >
                      <Phone size={16} />
                      {order.telefon}
                    </a>
                  </TableCell>

                  <TableCell style={{textAlign: "center", fontSize: "16px"}}>
                    <strong>{order.cena} PLN</strong>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>


      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Wierszy na stronie:"
      />
    </div>
  );
};

export default OrdersTable;
