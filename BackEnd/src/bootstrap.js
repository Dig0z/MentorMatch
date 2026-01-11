const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const google_auth_service = require('./services/google_auth_service.js');

async function bootstrap(app) {
    
    try {
        await google_auth_service.loadSavedTokens();
    } catch (error) {
        // In test/development environment, Google tokens table might not exist
        // This is acceptable - the app can still function without Google integration
        console.warn('Could not load Google tokens (this is OK in test environment):', error.message);
    }
    
    const PORT = (process.env.PORT || 5000);

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

} 

module.exports = bootstrap;