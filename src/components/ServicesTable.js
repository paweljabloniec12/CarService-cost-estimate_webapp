import React, { useEffect, useState } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import NewServiceForm from './NewServiceForm';
import '../componentsCSS/ServicesTable.css';
import supabase from '../supabaseClient.js';


const ServicesTable = () => {
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [editFormData, setEditFormData] = useState({ nazwa: '', cena: '' });

    const fetchServices = async () => {
        try {
            const { data: services, error } = await supabase.from('uslugi').select('*').order('nazwa', { ascending: true });
            if (error) throw error;
            const sortedServices = services.sort((a, b) =>
                a.nazwa.localeCompare(b.nazwa, 'pl', { sensitivity: 'base' })
            );
            setServices(sortedServices);
            setSelectedServices([]);
            setSelectAll(false);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleRowClick = (service) => {
        if (selectedServices.includes(service.id)) return;
        setEditingService(service);
        setEditFormData({
            nazwa: service.nazwa,
            cena: service.cena || '0'
        });
    };

    const handleEditFormClose = () => {
        setEditingService(null);
        setEditFormData({ nazwa: '', cena: '' });
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('uslugi')
                .update(editFormData)
                .eq('id', editingService.id);
            if (error) throw error;
            await fetchServices();
            handleEditFormClose();
        } catch (error) {
            console.error('Error updating service:', error);
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredServices = services.filter((service) =>
        service.nazwa.toLowerCase().includes(searchQuery.toLowerCase())
    );
    useEffect(() => {
        setPage(0);
    }, [searchQuery]);

    const handleAddService = () => {
        setShowAddServiceModal(true);
    };

    const handleSelectService = (id) => {
        setSelectedServices((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((serviceId) => serviceId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedServices([]);
        } else {
            setSelectedServices(services.map((service) => service.id));
        }
        setSelectAll(!selectAll);
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return '-';
        const numericPrice = parseFloat(price);
        return isNaN(numericPrice) ? '-' : `${numericPrice.toFixed(2)} zł`;
    };

    useEffect(() => {
        if (services.length === 0) {
            setSelectAll(false);
        } else {
            setSelectAll(selectedServices.length === services.length);
        }
    }, [selectedServices, services]);

    const deleteSelectedServices = async () => {
        try {
            await Promise.all(
                selectedServices.map((serviceId) =>
                    supabase.from('uslugi').delete().eq('id', serviceId)
                )
            );
            await fetchServices();
        } catch (error) {
            console.error('Error deleting services:', error);
        }
    };

    return (
        <div className="container">
            <div className="action-buttons">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddService}
                    style={{ marginBottom: '10px' }}
                >
                    Dodaj usługę
                </Button>

                {selectedServices.length > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={deleteSelectedServices}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                )}
            </div>

            <div className="search-container">
                <TextField
                    fullWidth
                    label="Wyszukaj usługę"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    disabled={services.length === 0}
                    className="search-field"
                />
            </div>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    color="primary"
                                />
                            </TableCell>
                            <TableCell className="table-head-cell">Nazwa usługi</TableCell>
                            <TableCell className="table-head-cell">Cena</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredServices
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((service) => (
                                <TableRow
                                    key={service.id}
                                    hover
                                    onClick={() => handleRowClick(service)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedServices.includes(service.id)}
                                            onChange={() => handleSelectService(service.id)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>{service.nazwa}</TableCell>
                                    <TableCell>{formatPrice(service.cena)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredServices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Wierszy na stronie:"
            />

            {showAddServiceModal && (
                <NewServiceForm
                    open={showAddServiceModal}
                    onClose={() => {
                        setShowAddServiceModal(false);
                        fetchServices();
                    }}
                    onServiceAdded={() => {
                        setShowAddServiceModal(false);
                        fetchServices();
                    }}
                />
            )}

            {/* Dialog edycji usługi */}
            <Dialog open={!!editingService} onClose={handleEditFormClose}>
                <DialogTitle>Edytuj usługę</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nazwa"
                        label="Nazwa usługi"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.nazwa}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="cena"
                        label="Cena"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editFormData.cena}
                        onClick={(e) => {
                            e.target.value = '';
                          }}
                        onChange={handleEditFormChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditFormClose}>Anuluj</Button>
                    <Button onClick={handleEditFormSubmit} variant="contained" color="primary">
                        Zapisz
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ServicesTable;