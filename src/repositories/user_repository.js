const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function get_users() {
    const res = 
    `SELECT *
    FROM users`;
    return res.row;
}

async function register_user(name, surname, email, password_hash, role, bio, photo_url) {
    const query =
    `INSERT INTO users(name, surname, email, password_hash, role, bio, photo_url)
    VALUES($1, $2, $3, $4,$5, $6, $7)
    RETURNING *
    `;
    return await pool.query(query, [name, surname, email, password_hash, role, bio, photo_url]);
};

async function get_login_data(email) {
    const query = `
    SELECT id, password_hash
    FROM users
    WHERE email LIKE $1
    `;
    return await pool.query(query, [email]);
};

module.exports = {
    get_users,
    register_user,
    get_login_data
};