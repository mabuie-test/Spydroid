const router = require('express').Router();
const { postData, getData } = require('../controllers/dataController');
const auth = require('../middleware/auth');

// App Android envia dados (sem auth)
router.post('/data', postData);

// Frontend consulta dados só após login
router.get('/data', auth, getData);

module.exports = router;
