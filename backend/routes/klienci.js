const express = require('express');
const router = express.Router();
const klientController = require('../controllers/klientController');

// Trasy CRUD dla klientów
router.get('/', klientController.getAllClients);
router.post('/', klientController.addClient);
router.put('/:id', klientController.updateClient);
router.delete('/:id', klientController.deleteClient);

module.exports = router;
