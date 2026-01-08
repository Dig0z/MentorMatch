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
        err.status = 404;
        throw err;
    }
    const {id, password_hash, role} = identity;
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
    return {valid, token, role};
};

async function update_name(user_id, user_data) {
    const new_name = user_data.new_name ?? user_data.name;
    const result = await user_repository.update_name(user_id, new_name);
    const {name} = result || {};
    if(!name) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return {name};
};

async function update_surname(user_id, user_data) {
    const new_surname = user_data.new_surname ?? user_data.surname;
    const result = await user_repository.update_surname(user_id, new_surname);
    const {surname} = result || {};
    if(!surname) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return {surname};
};

async function update_bio(user_id, user_data) {
    const new_bio = user_data.new_bio ?? user_data.bio;
    const result = await user_repository.update_bio(user_id, new_bio);
    const {bio} = result || {};
    if(bio === undefined) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return {bio};
};

async function update_photo_url(user_id, user_data) {
    const {new_url} = user_data;
    const result = await user_repository.update_photo_url(user_id, new_url);
    const {photo_url} = result || {};
    if(photo_url === undefined) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return {photo_url};
};

async function get_mentors(filters) {
    const {name = null, surname = null, email = null, availability_day = null, sector = null, last_id = 0, limit = 20} = filters;
    const result = await user_repository.get_mentors(name, surname, email, availability_day, sector, last_id, limit);
    if(!result || result.length == 0) {
        const err = new Error('No mentors found with the selected filters');
        err.status = 404;
        throw err;
    }
    return result;
};

async function get_id_from_email(email) {
    const {id} = await user_repository.get_id_from_email(email);
    if(!id) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return id;
};

async function get_me(user_id) {
    const data = await user_repository.get_public_data(user_id);
    if(!data) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return data;
};

module.exports = {
    register,
    login,
    get_mentors,
    update_name,
    update_surname,
    update_bio,
    update_photo_url,
    get_id_from_email
    ,get_me
};