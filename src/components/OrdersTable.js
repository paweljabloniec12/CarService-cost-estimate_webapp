import React, { useEffect, useState } from 'react';
import OrderForm from './OrderForm';
import Modal from './Modal';
import '../componentsCSS/OrdersTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Phone } from 'lucide-react';
import supabase from '../supabaseClient.js';
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
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('zlecenia')
        .select(`
          id,
          pojazdy (id, producent, model, nr_rejestracyjny),
          uszkodzenia,
          klienci (id, imie, nazwisko, telefon),
          cena
        `);

      if (error) {
        console.error('Błąd podczas pobierania zleceń:', error);
      } else {
        setOrders(data);
        setSelectedOrders([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.error('Błąd podczas komunikacji z Supabase:', error);
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
      const { data: orderData, error: orderError } = await supabase
        .from('zlecenia')
        .select(`
          id,
          pojazdy (id, producent, model, nr_rejestracyjny),
          uszkodzenia,
          data_zlecenia,
          klienci (id, imie, nazwisko, telefon),
          cena,
          zlecenia_uslugi (id, usluga_id, ilosc, kwota, uslugi (id, nazwa, cena))
        `)
        .eq('id', orderId)
        .single();
  
      if (orderError) throw orderError;
  
      setFormData(orderData);
      setShowForm(true);
    } catch (error) {
      console.error('Błąd podczas pobierania danych zlecenia:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
    setSelectAll(!selectAll);
  };

  const deleteSelectedOrders = async () => {
    try {
      const { error } = await supabase
        .from('zlecenia')
        .delete()
        .in('id', selectedOrders);

      if (error) throw error;
      
      await fetchOrders();
    } catch (error) {
      console.error('Błąd podczas usuwania zleceń:', error);
    }
  };

  const toggleForm = (resetForm = false) => {
    if (resetForm) {
      setFormData({});
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

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.klienci.imie} ${order.klienci.nazwisko}`.toLowerCase();
    const registrationNumber = order.pojazdy.nr_rejestracyjny?.toLowerCase() || '';
    return fullName.includes(searchQuery.toLowerCase()) || 
           registrationNumber.includes(searchQuery.toLowerCase());
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
              .sort((a, b) => b.id - a.id)
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => handleOrderClick(order.id)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      backgroundColor: hoveredRowId === order.id ? '#f0f0f0' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredRowId(order.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <strong>#{order.id}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{order.pojazdy.producent} {order.pojazdy.model}</strong>
                    <br />
                    {order.pojazdy.nr_rejestracyjny || ''}
                  </TableCell>
                  <TableCell>{order.uszkodzenia}</TableCell>
                  <TableCell>
                    <strong>{order.klienci.imie} {order.klienci.nazwisko}</strong>
                    <br />
                    <a
                      href={`tel:+48${order.klienci.telefon}`}
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
                      {order.klienci.telefon}
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