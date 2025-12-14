const {pool} = require('../config/db.js')

async function get_users() {
    const res = 
    `SELECT *
    FROM users`;
    return res.row;
}

async function register_user(name, surname, email, password_hash, role, bio, photo_url) {
    const res =
    `INSERT INTO users(name, surname, email, password_hash, role, bio, photo_url)
    VALUES($1, $2, $3, $4,$5, $6, $7)
    RETURNING *
    `;
    return await db.query(res, [name, surname, email, password_hash, role, bio, photo_url]);
};

async function get_login_data(email) {
    const res = `
    SELECT password_hash
    FROM users
    WHERE email LIKE '$1'
    `;
    return await db.query(res, [email]);
};

modules.exports = {
    get_users,
    register_user,
    get_login_data
};