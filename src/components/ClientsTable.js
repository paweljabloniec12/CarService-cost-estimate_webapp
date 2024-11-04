import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Phone, Mail } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import NewClientForm from './NewClientForm';
import '../componentsCSS/ClientsTable.css';

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddKlientModal, setShowAddKlientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Bardziej specyficzne style z !important
  const checkboxColumnStyle = {
    width: '48px !important',
    padding: '10px !important',
    maxWidth: '48px !important',
    minWidth: '48px !important',
    boxSizing: 'border-box !important',
  };

  const columnStyles = {
    name: {
      width: '35%',
      minWidth: 'auto',
    },
    phone: {
      width: '30%',
      minWidth: 'auto',
    },
    email: {
      width: '35%',
      minWidth: 'auto',
    },
  };

// Pobieranie klientów z bazy
const fetchClients = async () => {
  try {
    const response = await axios.get('/api/klienci');
    setClients(response.data);
    setSelectedClients([]); // Reset zaznaczonych klientów
    setSelectAll(false); // Reset zaznaczenia wszystkich
  } catch (error) {
    console.error('Błąd podczas pobierania klientów:', error);
  }
};

useEffect(() => {
  fetchClients();
}, []);

// Obsługa zaznaczania pojedynczego klienta
const handleSelectClient = (id) => {
  setSelectedClients((prevSelected) =>
    prevSelected.includes(id)
      ? prevSelected.filter((clientId) => clientId !== id)
      : [...prevSelected, id]
  );
};

// Obsługa zaznaczania wszystkich klientów
const handleSelectAll = () => {
  if (selectAll) {
    setSelectedClients([]);
  } else {
    setSelectedClients(clients.map((client) => client.id));
  }
  setSelectAll(!selectAll);
};

// Effect do aktualizacji stanu selectAll
useEffect(() => {
  if (clients.length === 0) {
    setSelectAll(false);
  } else {
    setSelectAll(selectedClients.length === clients.length);
  }
}, [selectedClients, clients]);

// Funkcja do usuwania zaznaczonych klientów
const deleteSelectedClients = async () => {
  try {
    await Promise.all(
      selectedClients.map((clientId) => axios.delete(`/api/klienci/${clientId}`))
    );
    fetchClients();
  } catch (error) {
    console.error('Błąd podczas usuwania klientów:', error);
  }
};

// Obsługa paginacji
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

// Filtrowanie klientów
const filteredClients = clients.filter((client) => {
  const fullName = `${client.imie} ${client.nazwisko}`.toLowerCase();
  return fullName.includes(searchQuery.toLowerCase());
});

// Formatowanie numeru telefonu
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

// Obsługa dodawania klienta
const handleAddClient = () => {
  setShowAddKlientModal(true); // Otwórz Drawer
};

// Funkcja otwierająca dialog edycji
const handleEditClient = (client) => {
  setEditingClient(client);
  setIsEditDialogOpen(true);
};

// Funkcja zamykająca dialog edycji
const handleCloseEditDialog = () => {
  setEditingClient(null);
  setIsEditDialogOpen(false);
};

// Aktualizacja danych klienta
const handleSaveClient = async () => {
  try {
    await axios.put(`/api/klienci/${editingClient.id}`, editingClient);
    fetchClients(); // Odśwież klientów po zapisie
    handleCloseEditDialog();
  } catch (error) {
    console.error("Błąd podczas aktualizacji klienta:", error);
  }
};

  return (
    <div className="container">
      <div className="action-buttons">
        <Button variant="contained" color="primary" onClick={handleAddClient}>
          Dodaj klienta
        </Button>

        {selectedClients.length > 0 && (
          <Button variant="contained" color="error" onClick={deleteSelectedClients}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        )}
      </div>

      <div className="search-container">
        <TextField
          fullWidth
          label="Wyszukaj klienta"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          disabled={clients.length === 0}
          className="search-field"
        />
      </div>

      <TableContainer component={Paper}>
        <Table 
          size="small" 
          sx={{
            tableLayout: 'fixed',
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& .MuiTableCell-checkbox': {
              ...checkboxColumnStyle,
            },
          }}
        >
          <TableHead style={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell 
                padding="checkbox"
                sx={checkboxColumnStyle}
              >
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  color="primary"
                  sx={{ padding: '0 !important' }}
                />
              </TableCell>
              <TableCell sx={columnStyles.name}>
                Imię i Nazwisko
              </TableCell>
              <TableCell sx={columnStyles.phone}>
                Numer Telefonu
              </TableCell>
              <TableCell sx={columnStyles.email}>
                Email
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell 
                    padding="checkbox"
                    sx={checkboxColumnStyle}
                  >
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                      color="primary"
                      sx={{ padding: '0 !important' }}
                    />
                  </TableCell>
                  <TableCell style={{ cursor: 'pointer' }} sx={columnStyles.name} onClick={() => handleEditClient(client)}>
                    <strong>{client.imie} {client.nazwisko}</strong>
                  </TableCell>
                  <TableCell sx={columnStyles.phone}>
                    <a href={`tel:+48${client.telefon}`} className="phone-link">
                      <Phone size={16} />
                      {formatPhoneNumber(client.telefon)}
                    </a>
                  </TableCell>
                  <TableCell sx={columnStyles.email}>
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="email-link">
                        <Mail size={16} />
                        {client.email}
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredClients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Wierszy na stronie:"
      />

      {showAddKlientModal && (
        <NewClientForm
          open={showAddKlientModal}
          onClose={() => {
            setShowAddKlientModal(false);
            fetchClients();
          }}
          onClientAdded={() => {
            setShowAddKlientModal(false);
            fetchClients();
          }}
        />
      )}

      {/* Okno dialogowe edycji */}
    {isEditDialogOpen && (
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edycja klienta</DialogTitle>
        <DialogContent>
          <TextField
            label="Imię"
            value={editingClient.imie || ''}
            onChange={(e) => setEditingClient({ ...editingClient, imie: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Nazwisko"
            value={editingClient.nazwisko || ''}
            onChange={(e) => setEditingClient({ ...editingClient, nazwisko: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Telefon"
            value={editingClient.telefon || ''}
            onChange={(e) => setEditingClient({ ...editingClient, telefon: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Email"
            value={editingClient.email || ''}
            onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Anuluj</Button>
          <Button onClick={handleSaveClient} color="primary" variant='contained'>Zapisz</Button>
        </DialogActions>
      </Dialog>
    )}
      
    </div>
  );
};

export default ClientsTable;