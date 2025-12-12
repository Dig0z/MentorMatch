const {pool} = require('../config/db.js')

async function get_users() {
    const res = 
    `SELECT *
    FROM users`;
    return res.row;
}

modules.exports = {
    get_users
};