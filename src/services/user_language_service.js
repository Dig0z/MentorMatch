const repo = require('../repositories/user_language_repository');

async function add_language(user_id, data) {
  const {language_name} = data;
  const result = await repo.add_language(user_id, language_name);
  if (!result) {
    return {language_name};
  }
  return result;
}

async function get_languages(user_id) {
  const rows = await repo.get_languages(user_id);
  return rows;
}

async function remove_language(user_id, data) {
  const {language_name} = data;
  const result = await repo.remove_language(user_id, language_name);
  return result || {language_name};
}

module.exports = {
  add_language,
  get_languages,
  remove_language
};