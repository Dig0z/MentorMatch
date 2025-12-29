const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

//test only
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
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

async function get_mentors(name, surname, email, availability_day, sector, last_id, limit) {
    let index = 0;
    const values = [];
    let query = `
    SELECT *
    FROM users u`;

    if(availability_day) {
        query += ` JOIN mentor_availability ma ON u.id = ma.mentor_id`;
    }

    if(sector) {
        query += ` JOIN mentor_sectors ms ON u.id = ms.mentor_id`;
    }
    
    values.push(last_id);
    index++;
    query += ` WHERE u.id > $${index}`;

    if(name) {
        values.push(name);
        index++;
        query += ` AND u.name LIKE CONCAT('%', $${index}, '%')`;
    }

    if(surname) {
        values.push(surname);
        index++;
        query += ` AND u.surname LIKE CONCAT('%', $${index}, '%')`;
    }

    if(email) {
        values.push(email);
        index++;
        query += ` AND u.email LIKE CONCAT('%', $${index}, '%')`;
    }

    if(availability_day) {
        values.push(availability_day);
        index++;
        query += ` AND ma.weekday = $${index}`;
    }

    if(sector) {
        values.push(sector);
        index++;
        query += ` AND ms.sector_name LIKE CONCAT('%', $${index}, '%')`;
    }

    values.push(limit);
    index++;
    query += ` LIMIT $${index}`;

    const result = await pool.query(query, values);
    return result.rows;
}

module.exports = {
    get_users,
    register_user,
    get_login_data,
    get_mentors
};