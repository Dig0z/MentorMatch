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
        SELECT u.name, u.surname, u.bio, u.photo_url, ma.weekday, ma.start_time, ma.end_time, ms.sector_name 
        FROM users u join mentor_availability ma on u.id = ma.mentor_id join mentor_sectors ms on u.id = ms.mentor_id
    `;
    
    values.push(last_id);
    index++;
    query += ` WHERE u.id > $${index}`;

    if(name) {
        values.push(name);
        index++;
        query += ` AND u.name LIKE '%' || $${index} || '%'`;
    }

    if(surname) {
        values.push(surname);
        index++;
        query += ` AND u.surname LIKE '%' || $${index} || '%'`;
    }

    if(email) {
        values.push(email);
        index++;
        query += ` AND u.email LIKE '%' || $${index} || '%'`;
    }

    if(availability_day) {
        values.push(availability_day);
        index++;
        query += ` AND ma.weekday = $${index}`;
    }

    if(sector) {
        values.push(sector);
        index++;
        query += ` AND ms.sector_name LIKE '%' || $${index} || '%'`;
    }

    values.push(limit);
    index++;
    query += ` ORDER BY id LIMIT $${index}`;

    const result = await pool.query(query, values);
    return result.rows;
}

async function update_name(user_id, new_name) {
    const query = `
        UPDATE users
        SET name = $1
        WHERE id = $2
        RETURNING id, name;
    `;
  const result = await pool.query(query, [new_name, user_id]);
  return result.rows[0];
}

async function update_surname(user_id, new_surname) {
    const query = `
        UPDATE users
        SET surname = $1
        WHERE id = $2
        RETURNING id, surname;
    `;
  const result = await pool.query(query, [new_surname, user_id]);
  return result.rows[0];
}

async function update_bio(user_id, new_bio) {
    const query = `
        UPDATE users
        SET bio = $1
        WHERE id = $2
        RETURNING id, bio;
    `;
  const result = await pool.query(query, [new_bio, user_id]);
  return result.rows[0];
}

async function update_photo_url(user_id, new_url) {
    const query = `
        UPDATE users
        SET photo_url = $1
        WHERE id = $2
        RETURNING id, photo_url;
    `;
  const result = await pool.query(query, [new_url, user_id]);
  return result.rows[0];
}



module.exports = {
    get_users,
    register_user,
    get_login_data,
    get_mentors,
    update_name,
    update_surname,
    update_bio,
    update_photo_url
};