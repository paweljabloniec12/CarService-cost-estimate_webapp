const express = require('express');
const router = express.Router();
const uslugaController = require('../controllers/uslugaController');

// Trasy CRUD dla usług
router.get('/', uslugaController.getAllServices);
router.post('/', uslugaController.addService);
router.put('/:id', uslugaController.updateService);
router.delete('/:id', uslugaController.deleteService);

module.exports = router;
