const router = require('express').Router();
const { postData, getData } = require('../controllers/dataController');
const auth = require('../middleware/auth');

// App Android envia
router.post('/data', postData);

// Front-end protegido
router.get('/data', auth, getData);

module.exports = router;
