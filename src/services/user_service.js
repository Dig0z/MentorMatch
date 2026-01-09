const user_repository = require('../repositories/user_repository.js');
const {send_notification} = require('./notification_service.js');
const {sendEmail} = require('./google_auth_service.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function register(user_data) {
    //bio e photo_url sono opzionali ed in caso siano undefined li trasformo direttamente in null
    const {name, surname, email, password, role, bio = null, photo_url = null} = user_data;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const user = await user_repository.register_user(name, surname, email, password_hash, role, bio, photo_url);
    const {id} = user;
    const token = jwt.sign(
        {id: id},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    console.log(`Registration completed`);
    const message = `
        Hello and welcome to your new account!\n
        Start exploring MentorMatch and find the best opportunity for you!
    `;
    await send_notification(id, message);
    await sendEmail({
        to: email,
        subject: 'Registration completed',
        html: message
    });
    return {user, token};
}

async function login(login_data) {
    const {email, password} = login_data;
    const identity = await user_repository.get_login_data(email);
    if(!identity) {
        const err = new Error('Email is not registered');
        err.status = 404;
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
    console.log('Logged in');
    return {valid, token};
}

async function update_name(user_id, user_data) {
    const {new_name} = user_data;
    const {name} = await user_repository.update_name(user_id, new_name);
    if(!name) {
        const err = new Error('User not found');
        err.status(404);
        throw err;
    }
    console.log(`Name updated to ${name}`);
    return name;
}

async function update_surname(user_id, user_data) {
    const {new_surname} = user_data;
    const {surname} = await user_repository.update_name(user_id, new_surname);
    if(!surname) {
        const err = new Error('User not found');
        err.status(404);
        throw err;
    }
    console.log(`Surname updated to ${surname}`);
    return surname;
}

async function update_bio(user_id, user_data) {
    const {new_bio} = user_data;
    const {bio} = await user_repository.update_name(user_id, new_bio);
    if(!bio) {
        const err = new Error('User not found');
        err.status(404);
        throw err;
    }
    console.log(`Bio updated`);
    return bio;
}

async function update_photo_url(user_id, user_data) {
    const {new_url} = user_data;
    const {photo_url} = await user_repository.update_name(user_id, new_url);
    if(!photo_url) {
        const err = new Error('User not found');
        err.status(404);
        throw err;
    }
    console.log(`Photo url updated`);
    return photo_url;
}

async function get_mentors(filters) {
    const {name = null, surname = null, email = null, availability_day = null, sector = null, last_id = 0, limit = 20} = filters;
    const result = await user_repository.get_mentors(name, surname, email, availability_day, sector, last_id, limit);
    if(!result || result.length == 0) {
        const err = new Error('No mentors found with the selected filters');
        err.status = 404;
        throw err;
    }
    console.log(`Found ${result.length} mentors`);
    return result;
}

async function get_id_from_email(email) {
    const {id} = await user_repository.get_id_from_email(email);
    if(!id) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return id;
}

async function get_role(user_id) {
    const {role} = await user_repository.get_role(user_id);
    if(!role) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return role;
}

async function get_email_from_id(id) {
    const {email} = await user_repository.get_email_from_id(id);
    if(!email) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return email;
}

module.exports = {
    register,
    login,
    get_mentors,
    update_name,
    update_surname,
    update_bio,
    update_photo_url,
    get_id_from_email,
    get_email_from_id,
    get_role
};