import api from './api';

const generateKeys = (p, q, D) => {
    return api.post('/crypto/generate-keys', { p, q, D });
};

const getKeys = () => {
    return api.get('/crypto/keys');
};

const encrypt = (message, keyId) => {
    return api.post('/crypto/encrypt', { message, keyId });
};

const decrypt = (ciphertexts, keyId) => {
    return api.post('/crypto/decrypt', { ciphertexts, keyId });
};

const cloudMultiply = (ciphertexts, n) => {
    return api.post('/crypto/cloud/homomorphic', { ciphertexts, n });
};

const CryptoService = {
    generateKeys,
    getKeys,
    encrypt,
    decrypt,
    cloudMultiply
};

export default CryptoService;
