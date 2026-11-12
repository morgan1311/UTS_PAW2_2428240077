const express = require('express');
const router = express.Router();
const pinjamanController = require('../controllers/pinjamanController');

router.get('/', pinjamanController.getAll);
router.get('/:id', pinjamanController.getById);
router.post('/', pinjamanController.create);
router.put('/:id', pinjamanController.update);
router.delete('/:id', pinjamanController.remove);

module.exports = router;
