const express = require('express');
const router = express.Router();
const controller = require('../controllers/cryptoController');
const { verifyToken } = require('../middleware/authJwt');

router.post('/generate-keys', [verifyToken], controller.generateKeyPair);
router.get('/keys', [verifyToken], controller.getKeys);
router.post('/encrypt', [verifyToken], controller.encryptMessage);
router.post('/decrypt', [verifyToken], controller.decryptMessage);
router.post('/cloud/homomorphic', controller.cloudMultiply); // Cloud might not need user auth, but let's keep it open or minimal

module.exports = router;
