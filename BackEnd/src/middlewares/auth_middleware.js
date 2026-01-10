const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const jwt = require('jsonwebtoken');

function auth(req, res, next) {

    //prendo l'header che dovrebbe contenere il jwt
    //e dovrei ottenere la stringa: 'Bearer <jwt>'
    const header = req.get('authorization');

    //verifico che sia effettivamente presente
    if(!header) {
        return res.status(401).json('Missing authorization header');
    }

    //divido la stringa in 'Bearer', '<jwt>' e prendo solo il jwt
    const token = header.split(' ')[1];
    
    //se l'operazione va male l'header è stato formattato male
    if(!token) {
        return res.status(401).json('Missing token or invalid format');
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        //aggiungo alla req il parametro .user, che conterrà il jwt
        //"prima della firma", cioè nella forma: {{id: id}, JWT_SECRET, {expiresIn: *}}
        req.user = payload;
        //vado alla prossima funzione chiamata dal controller
        next();
    } catch (err) {
        if (err && err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: { status: 401, message: 'Token expired' } });
        }
        return res.status(401).json({ success: false, error: { status: 401, message: 'Invalid token' } });
    }

};

module.exports = auth;