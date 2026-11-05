const express = require('express');
const router = express.Router();
const petugasController = require('../controllers/petugasController');

router.post('/', petugasController.create);
router.get('/', petugasController.getAll);

module.exports = router;
