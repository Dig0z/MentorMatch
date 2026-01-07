const {pool} = require('../config/db.js');

//Gestione token di google
async function insert_token(access_token, refresh_token, scope, token_type, expiry_date) {
    const query = `
        INSERT INTO google_meet_token(access_token, refresh_token, scope, token_type, expiry_date)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [access_token, refresh_token, scope, token_type, expiry_date];
    const tokens = await pool.query(query, values);
    return tokens.rows[0];
}

async function get_tokens() {
    const query = `
        SELECT *
        FROM google_meet_token
    `;
    const tokens = await pool.query(query, []);
    return tokens.rows[0];
}

async function update_token(id, access_token, refresh_token, scope, token_type, expiry_date) {
    const query = `
        UPDATE google_meet_token
        SET access_token = $1,
            refresh_token = $2,
            scope = $3,
            token_type = $4,
            expiry_date = $5
        WHERE id = $6
        RETURNING *
    `;
    const values = [access_token, refresh_token, scope, token_type, expiry_date, id];
    const tokens = await pool.query(query, values);
    return tokens.rows[0];
}

module.exports = {
    insert_token,
    get_tokens,
    update_token
}