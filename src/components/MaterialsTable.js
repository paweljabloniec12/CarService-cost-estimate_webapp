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
    MenuItem,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import supabase from '../supabaseClient.js';
import '../componentsCSS/MaterialsTable.css';
import NewMaterialForm from './NewMaterialForm';

const MaterialsTable = () => {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [editFormData, setEditFormData] = useState({
        nazwa: '',
        jednostka: '',
        cena: ''
    });

    const fetchMaterials = async () => {
        try {
            const { data: materials, error } = await supabase.from('materialy').select('*').order('nazwa', { ascending: true });
            if (error) throw error;
            const sortedMaterials = materials.sort((a, b) =>
                a.nazwa.localeCompare(b.nazwa, 'pl', { sensitivity: 'base' })
            );
            setMaterials(sortedMaterials);
            setSelectedMaterials([]);
            setSelectAll(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleRowClick = (material) => {
        if (selectedMaterials.includes(material.id)) return;
        setEditingMaterial(material);
        setEditFormData({
            nazwa: material.nazwa,
            jednostka: material.jednostka || '',
            cena: material.cena || '0'
        });
    };

    const handleEditFormClose = () => {
        setEditingMaterial(null);
        setEditFormData({ nazwa: '', jednostka: '', cena: '' });
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('materialy')
                .update(editFormData)
                .eq('id', editingMaterial.id);
            if (error) throw error;
            await fetchMaterials();
            handleEditFormClose();
        } catch (error) {
            console.error('Error updating material:', error);
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

    const filteredMaterials = materials.filter((material) =>
        material.nazwa.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setPage(0);
    }, [searchQuery]);

    const handleSelectMaterial = (id) => {
        setSelectedMaterials((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((materialId) => materialId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedMaterials([]);
        } else {
            setSelectedMaterials(materials.map((material) => material.id));
        }
        setSelectAll(!selectAll);
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return '-';
        const numericPrice = parseFloat(price);
        return isNaN(numericPrice) ? '-' : `${numericPrice.toFixed(2)} zł`;
    };

    const deleteSelectedMaterials = async () => {
        try {
            await Promise.all(
                selectedMaterials.map((materialId) =>
                    supabase.from('materialy').delete().eq('id', materialId)
                )
            );
            await fetchMaterials();
        } catch (error) {
            console.error('Error deleting materials:', error);
        }
    };

    useEffect(() => {
        if (materials.length === 0) {
            setSelectAll(false);
        } else {
            setSelectAll(selectedMaterials.length === materials.length);
        }
    }, [selectedMaterials, materials]);


    return (
        <div className="container">
            <div className="action-buttons">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowAddMaterialModal(true)}
                    style={{ marginBottom: '10px' }}
                >
                    Dodaj materiał
                </Button>

                {selectedMaterials.length > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={deleteSelectedMaterials}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                )}
            </div>

            <div className="search-container">
                <TextField
                    fullWidth
                    label="Wyszukaj materiał"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    disabled={materials.length === 0}
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
                            <TableCell className="head-cell">Nazwa materiału</TableCell>
                            <TableCell className="head-cell">Jednostka</TableCell>
                            <TableCell className="head-cell">Cena</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMaterials
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((material) => (
                                <TableRow
                                    key={material.id}
                                    hover
                                    onClick={() => handleRowClick(material)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedMaterials.includes(material.id)}
                                            onChange={() => handleSelectMaterial(material.id)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>{material.nazwa}</TableCell>
                                    <TableCell>{material.jednostka}</TableCell>
                                    <TableCell>{formatPrice(material.cena)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredMaterials.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Wierszy na stronie:"
            />

            {showAddMaterialModal && (
                <NewMaterialForm
                    open={showAddMaterialModal}
                    onClose={() => {
                        setShowAddMaterialModal(false);
                        fetchMaterials(); // Odświeżenie listy materiałów po dodaniu nowego
                    }}
                    onMaterialAdded={(newMaterialId) => {
                        setShowAddMaterialModal(false);
                        fetchMaterials(); // Odśwież dane materiałów
                    }}
                />
            )}

            {/* Dialog edycji materiału */}
            <Dialog open={!!editingMaterial} onClose={handleEditFormClose}>
                <DialogTitle>Edytuj materiał</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nazwa"
                        label="Nazwa materiału"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.nazwa}
                        onChange={handleEditFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="jednostka"
                        label="Jednostka"
                        select
                        fullWidth
                        variant="outlined"
                        value={editFormData.jednostka}
                        onChange={handleEditFormChange}
                    >
                        <MenuItem value="szt">Sztuka (szt)</MenuItem>
                        <MenuItem value="opak">Opakowanie (opak)</MenuItem>
                        <MenuItem value="kpl">Komplet (kpl)</MenuItem>
                        <MenuItem value="L">Litr (L)</MenuItem>
                    </TextField>
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

export default MaterialsTable;