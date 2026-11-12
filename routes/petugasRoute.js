const express = require('express');
const router = express.Router();
const petugasController = require('../controllers/petugasController');

router.get('/', petugasController.getAll);
router.get('/:id', petugasController.getById);
router.post('/', petugasController.create);

module.exports = router;
