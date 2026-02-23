import CryptoService from './crypto.service';

/**
 * AutoDemoService
 * Orchestrates a full end-to-end cryptographic demo.
 */
class AutoDemoService {
    async runFullDemo(onStepChange, onStepResult) {
        try {
            // STEP 1: Key Generation
            onStepChange('key');
            const keyRes = await CryptoService.generateKeys(61, 53, 2);
            const keyId = keyRes.data.keyId;
            // Store results to allow persistent view if user stops
            onStepResult('key', keyRes.data.results, keyId);
            await this.delay(1500);

            // STEP 2: Encryption
            onStepChange('encrypt');
            const encRes = await CryptoService.encrypt('gvp', keyId);
            const messageId = encRes.data.messageId;
            onStepResult('encrypt', encRes.data, null, messageId);
            await this.delay(1500);

            // STEP 3: Cloud Simulation
            onStepChange('cloud');
            const cloudRes = await CryptoService.cloudMultiply(messageId, keyId);
            onStepResult('cloud', cloudRes.data);
            await this.delay(1500);

            // STEP 4: Decryption
            onStepChange('decrypt');
            const decRes = await CryptoService.decrypt(messageId, keyId);
            onStepResult('decrypt', decRes.data);

            return { success: true };
        } catch (error) {
            console.error('Auto Demo Error:', error);
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const autoDemoService = new AutoDemoService();
export default autoDemoService;
