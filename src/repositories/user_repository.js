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
    const query = `
        INSERT INTO users(name, surname, email, password_hash, role, bio, photo_url)
        VALUES($1, $2, $3, $4,$5, $6, $7)
        RETURNING id, name, surname, email, role, bio, photo_url
    `;
    const result = await pool.query(query, [name, surname, email, password_hash, role, bio, photo_url]);
    return result.rows[0];
};

async function get_login_data(email) {
    const query = `
        SELECT id, password_hash, role
        FROM users
        WHERE email LIKE $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

async function update_name(user_id, new_name) {
    const query = `
        UPDATE users
        SET name = $1
        WHERE id = $2
        RETURNING name
    `;
  const result = await pool.query(query, [new_name, user_id]);
  return result.rows[0];
}

async function update_surname(user_id, new_surname) {
    const query = `
        UPDATE users
        SET surname = $1
        WHERE id = $2
        RETURNING surname
    `;
  const result = await pool.query(query, [new_surname, user_id]);
  return result.rows[0];
}

async function update_bio(user_id, new_bio) {
    const query = `
        UPDATE users
        SET bio = $1
        WHERE id = $2
        RETURNING bio
    `;
  const result = await pool.query(query, [new_bio, user_id]);
  return result.rows[0];
}

async function update_photo_url(user_id, new_url) {
    const query = `
        UPDATE users
        SET photo_url = $1
        WHERE id = $2
        RETURNING photo_url
    `;
  const result = await pool.query(query, [new_url, user_id]);
  return result.rows[0];
}

async function get_mentors(name, surname, email, availability_day, sector, last_id, limit) {
    let index = 0;
    const values = [];
    let query = `
        SELECT u.name, u.surname, u.email, u.bio, u.photo_url,
               ma.weekday, ma.start_time, ma.end_time,
               ms.sector_name,
               ul.language_name,
               r.avg_rating
        FROM users u
        LEFT JOIN mentor_availability ma ON u.id = ma.mentor_id
        LEFT JOIN mentor_sectors ms ON u.id = ms.mentor_id
        LEFT JOIN user_languages ul ON u.id = ul.user_id
        LEFT JOIN (
            SELECT mentor_id, ROUND(AVG(rating)::numeric, 1) AS avg_rating
            FROM reviews
            GROUP BY mentor_id
        ) r ON u.id = r.mentor_id
        WHERE u.role = 'mentor'
    `;
    
    values.push(last_id);
    index++;
    query += ` AND u.id > $${index}`;

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
    query += ` ORDER BY u.id LIMIT $${index}`;

    const result = await pool.query(query, values);
    return result.rows;
}

async function get_id_from_email(email) {
    const query = `
        SELECT id
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
}

async function get_public_data(user_id) {
    const query = `
        SELECT name, surname, email, role, bio, photo_url
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
}

async function get_role(user_id) {
    const query = `
        SELECT role
        FROM users
        WHERE id = $1
    `;
    const role = await pool.query(query, [user_id]);
    return role.rows[0];
}

async function get_email_from_id(id) {
    const query = `
        SELECT email
        FROM users
        WHERE id = $1
    `;
    const email = await pool.query(query, [id]);
    return email.rows[0];
}

module.exports = {
    get_users,
    register_user,
    get_login_data,
    update_name,
    update_surname,
    update_bio,
    update_photo_url,
    get_mentors,
    get_id_from_email,
    get_public_data,
    get_email_from_id,
    get_role
};
