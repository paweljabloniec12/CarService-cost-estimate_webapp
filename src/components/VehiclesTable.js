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
import NewVehicleForm from './NewVehicleForm';
import '../componentsCSS/VehiclesTable.css';
import supabase from '../supabaseClient.js';


const VehiclesTable = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editFormData, setEditFormData] = useState({
        producent: '',
        model: '',
        generacja: '',
        nr_rejestracyjny: '',
        vin: '',
        rok: '',
        przebieg: ''
    });

    const fetchVehicles = async () => {
        try {
            const { data: vehicles, error } = await supabase.from('pojazdy').select('*');
            if (error) throw error;
            setVehicles(vehicles);
            setSelectedVehicles([]);
            setSelectAll(false);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleRowClick = (vehicle) => {
        if (selectedVehicles.includes(vehicle.id)) return;
        setEditingVehicle(vehicle);
        setEditFormData({
            producent: vehicle.producent || '',
            model: vehicle.model || '',
            generacja: vehicle.generacja || '',
            nr_rejestracyjny: vehicle.nr_rejestracyjny || '',
            vin: vehicle.vin || '',
            rok: vehicle.rok || '',
            przebieg: vehicle.przebieg || ''
        });
    };

    const handleEditFormClose = () => {
        setEditingVehicle(null);
        setEditFormData({
            producent: '',
            model: '',
            generacja: '',
            nr_rejestracyjny: '',
            vin: '',
            rok: '',
            przebieg: ''
        });
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('pojazdy')
                .update(editFormData)
                .eq('id', editingVehicle.id);
            if (error) throw error;
            await fetchVehicles();
            handleEditFormClose();
        } catch (error) {
            console.error('Error updating vehicle:', error);
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

    const filteredVehicles = vehicles.filter((vehicle) => {
        const searchString = `${vehicle.producent} ${vehicle.model} ${vehicle.generacja || ''} ${vehicle.nr_rejestracyjny}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
    });

    const formatMileage = (mileage) => {
        return mileage ? mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " km" : "-";
    };

    const handleAddVehicle = () => {
        setShowAddVehicleModal(true);
    };

    const handleSelectVehicle = (id) => {
        setSelectedVehicles((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((vehicleId) => vehicleId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedVehicles([]);
        } else {
            setSelectedVehicles(vehicles.map((vehicle) => vehicle.id));
        }
        setSelectAll(!selectAll);
    };

    useEffect(() => {
        if (vehicles.length === 0) {
            setSelectAll(false);
        } else {
            setSelectAll(selectedVehicles.length === vehicles.length);
        }
    }, [selectedVehicles, vehicles]);

    const deleteSelectedVehicles = async () => {
        try {
            await Promise.all(
                selectedVehicles.map((vehicleId) =>
                    supabase.from('pojazdy').delete().eq('id', vehicleId)
                )
            );
            await fetchVehicles();
        } catch (error) {
            console.error('Error deleting vehicles:', error);
        }
    };

    const formatVehicleInfo = (vehicle) => {
        return (
            <div className="vehicle-info">
                <div className="vehicle-name">
                    <strong>
                        {vehicle.producent} {vehicle.model}
                        {vehicle.generacja && ` ${vehicle.generacja}`}
                    </strong>
                </div>
                <div className="license-plate">{vehicle.nr_rejestracyjny}</div>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="action-buttons">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddVehicle}
                    style={{ marginBottom: '10px' }}
                >
                    Dodaj pojazd
                </Button>

                {selectedVehicles.length > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={deleteSelectedVehicles}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                )}
            </div>

            <div className="search-container">
                <TextField
                    fullWidth
                    label="Wyszukaj pojazd"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    disabled={vehicles.length === 0}
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
                            <TableCell className="table-head-cell">Pojazd</TableCell>
                            <TableCell className="table-head-cell">Nr VIN</TableCell>
                            <TableCell className="table-head-cell">Rok produkcji</TableCell>
                            <TableCell className="table-head-cell">Przebieg</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredVehicles
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((vehicle) => (
                                <TableRow
                                    key={vehicle.id}
                                    hover
                                    onClick={() => handleRowClick(vehicle)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedVehicles.includes(vehicle.id)}
                                            onChange={() => handleSelectVehicle(vehicle.id)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>{formatVehicleInfo(vehicle)}</TableCell>
                                    <TableCell>{vehicle.vin || '-'}</TableCell>
                                    <TableCell>{vehicle.rok || '-'}</TableCell>
                                    <TableCell>{formatMileage(vehicle.przebieg)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredVehicles.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Wierszy na stronie:"
            />

            {showAddVehicleModal && (
                <NewVehicleForm
                    open={showAddVehicleModal}
                    onClose={() => {
                        setShowAddVehicleModal(false);
                        fetchVehicles();
                    }}
                    onVehicleAdded={() => {
                        setShowAddVehicleModal(false);
                        fetchVehicles();
                    }}
                />
            )}

            {/* Dialog edycji pojazdu */}
            <Dialog 
                open={!!editingVehicle} 
                onClose={handleEditFormClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edytuj pojazd</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="producent"
                        label="Producent"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.producent}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="model"
                        label="Model"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.model}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="generacja"
                        label="Generacja"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.generacja}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="nr_rejestracyjny"
                        label="Numer rejestracyjny"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.nr_rejestracyjny}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="vin"
                        label="Numer VIN"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.vin}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="rok"
                        label="Rok produkcji"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editFormData.rok}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="przebieg"
                        label="Przebieg (km)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editFormData.przebieg}
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

export default VehiclesTable;