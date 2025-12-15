require('dovent').config({path: '../.env'});
const jwt = require('jsonwebtoken');

function auth(req, res, next) {

    const header = req.getHeaders['authorization'];

    if(!header) {
        return res.status(401).json('Missing authorization header');
    }

    const token = header.split(' ')[1];
    
    if(!token) {
        return res.status(401).json('Missing token or invalid format');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();

}

module.exports = {
    auth
}