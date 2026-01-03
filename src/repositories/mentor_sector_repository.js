const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function add_sector(mentor_id, sector_name) {
    const query = `
        INSERT INTO mentor_sectors
        VALUES($1, $2)
        RETURNING sector_name
    `;
    const result = await pool.query(query, [mentor_id, sector_name]);
    return result.rows[0];
};

async function get_sectors(mentor_id) {
    const query = `
        SELECT sector_name
        FROM mentor_sectors
        WHERE mentor_id = $1
    `;
    const result = await pool.query(query, [mentor_id]);
    return result.rows;
};

async function change_sector(mentor_id, old_name, new_name) {
    const query = `
        UPDATE mentor_sectors
        SET sector_name = $1
        WHERE mentor_id = $2
        AND sector_name = $3 
        RETURNING old_name, new_name
    `;
    const result = await pool.query(query, [new_name, mentor_id, old_name]);
    return result.rows[0];
};

async function remove_sector(mentor_id, sector_name) {
    const query = `
        DELETE
        FROM mentor_sectors
        WHERE mentor_id = $1
        AND sector_name = $2
        RETURNING sector_name
    `;
    const result = await pool.query(query, [mentor_id, sector_name]);
    return result.rows[0];
};

module.exports = {
    add_sector,
    get_sectors,
    change_sector,
    remove_sector
};