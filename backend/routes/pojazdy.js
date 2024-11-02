const express = require('express');
const router = express.Router();
const pojazdController = require('../controllers/pojazdController');

// Trasy CRUD dla pojazdów
router.get('/', pojazdController.getAllVehicles);
router.post('/', pojazdController.addVehicle);
router.put('/:id', pojazdController.updateVehicle);
router.delete('/:id', pojazdController.deleteVehicle);

module.exports = router;
