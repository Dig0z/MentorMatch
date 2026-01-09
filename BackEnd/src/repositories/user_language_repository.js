const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function add_language(user_id, language_name) {
  const query = `
    INSERT INTO user_languages(user_id, language_name)
    VALUES($1, $2)
    ON CONFLICT (user_id, language_name) DO NOTHING
    RETURNING language_name
  `;
  const result = await pool.query(query, [user_id, language_name]);
  return result.rows[0];
}

async function get_languages(user_id) {
  const query = `
    SELECT language_name
    FROM user_languages
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [user_id]);
  return result.rows;
}

async function remove_language(user_id, language_name) {
  const query = `
    DELETE FROM user_languages
    WHERE user_id = $1 AND language_name = $2
    RETURNING language_name
  `;
  const result = await pool.query(query, [user_id, language_name]);
  return result.rows[0];
}

module.exports = {
  add_language,
  get_languages,
  remove_language
};