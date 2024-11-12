const express = require('express');
const { createContact, getContacts, deleteContact ,updateContact} = require('../controllers/contactController');
const router = express.Router();
const { importCSV, exportCSV } = require('../controllers/contactController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authenticate =require('../middleware/authenticate');

router.post('/contacts',authenticate, createContact);
router.get('/contacts',authenticate, getContacts);
router.delete('/contacts/:id',authenticate, deleteContact);
router.put('/contacts/:id', authenticate, updateContact);
router.post('/contacts/import',authenticate, upload.single('csvFile'), importCSV);
router.get('/contacts/export', authenticate,exportCSV);

module.exports = router;