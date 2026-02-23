import api from './api';

const generateKeys = (p, q, D) => {
    return api.post('/crypto/generate-keys', { p, q, D });
};

const getKeys = () => {
    return api.get('/crypto/keys');
};

const encrypt = (plaintext, keyId) => {
    return api.post('/crypto/encrypt', { plaintext, keyId });
};

const decrypt = (messageId, keyId) => {
    return api.post('/crypto/decrypt', { messageId, keyId });
};

const cloudMultiply = (messageId, keyId) => {
    return api.post('/crypto/cloud/homomorphic', { messageId, keyId });
};

const CryptoService = {
    generateKeys,
    getKeys,
    encrypt,
    decrypt,
    cloudMultiply
};

export default CryptoService;
