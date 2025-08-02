const router = require('express').Router();
const { postData, getData } = require('../controllers/dataController');
const auth = require('../middleware/auth');

// App Android envia sem auth
router.post('/data', postData);

// Frontend consulta com auth
router.get('/data', auth, getData);

module.exports = router;
