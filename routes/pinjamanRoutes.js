const express = require('express');
const router = express.Router();
const pinjamanController = require('../controllers/pinjamanController');

router.post('/', pinjamanController.create);
router.get('/', pinjamanController.getAll);
router.get('/:id', pinjamanController.getById);

module.exports = router;
