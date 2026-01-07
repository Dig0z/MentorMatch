const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const google_auth_service = require('./services/google_auth_service.js');

async function bootstrap(app) {
    
    await google_auth_service.loadSavedTokens();
    const PORT = (process.env.PORT || 5000);

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

} 

module.exports = bootstrap;