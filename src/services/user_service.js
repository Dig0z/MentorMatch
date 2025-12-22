const user_repository = require('../repositories/user_repository.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function register(user_data) {
    //bio e photo_url sono opzionali ed in caso siano undefined li trasformo direttamente in null
    const {name, surname, email, password, role, bio = null, photo_url = null} = user_data;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const user = await user_repository.register_user(name, surname, email, password_hash, role, bio, photo_url);
    console.log('User created');
    const token = jwt.sign(
        {id: user.id},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    return {user, token};
};

async function login(login_data) {
    const {email, password} = login_data;
    const identity = await user_repository.get_login_data(email);
    if(!identity) {
        const err = new Error('Email is not registered');
        err.status = 400;
        throw err;
    }
    const {id, password_hash} = identity;
    const valid = await bcrypt.compare(password, password_hash);
    if(!valid) {
        const err = new Error('Invalid password');
        err.status = 400;
        throw err;
    }
    const token = jwt.sign(
        {id: id},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    return {valid, token};
};

module.exports = {
    register,
    login
};