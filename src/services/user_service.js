const user_repository = require('../repositories/user_repository.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function register(user_data) {
    //bio e photo_url sono opzionali ed in caso siano undefined li trasformo direttamente in null
    const {name, surname, email, password, role, bio = null, photo_url = null} = user_data;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const user = await user_repository.register_user(name, surname, email, password_hash, role, bio, photo_url);
    const token = jwt.sign(
        {id: user.id, email: user.email, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    return {user, token};
};

async function login(user_data) {
    const {email, password} = user_data;
    const password_hash = await user_repository.get_login_data(email);
    return await bcrypt.compare(password, password_hash);
};

module.exports = {
    register,
    login
};