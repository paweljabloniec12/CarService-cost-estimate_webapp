const express = require('express');
const router = express.Router();
const zlecenieController = require('../controllers/zlecenieController');

// Trasy CRUD dla zleceń
router.get('/', zlecenieController.getAllOrders);
router.get('/:id/uslugi', zlecenieController.getServicesForOrder); // Przenieś tę trasę wyżej
router.get('/:id', zlecenieController.getOrderById); // Pobierz zlecenie według ID
router.post('/', zlecenieController.addOrder);
router.post('/:id/uslugi', zlecenieController.addServicesToOrder);
router.put('/:id', zlecenieController.updateOrder);
router.delete('/:id', zlecenieController.deleteOrder);
router.delete('/:id/uslugi', zlecenieController.deleteServicesForOrder);

module.exports = router;
