const mentor_sector_repository = require('../repositories/mentor_sector_repository.js');

async function add_sector(mentor_id, new_name) {
    const {sector_name} = new_name;
    const name = await mentor_sector_repository.add_sector(mentor_id, sector_name);
    if(!name || name.length == 0) {
        const err = new Error('Failed to add sector');
        err.status = 500;
        throw err;
    }
    console.log(`Sector ${sector_name} added`);
    return name;
};

async function get_sectors(mentor_id) {
    const sectors = await mentor_sector_repository.get_sectors(mentor_id);
    if(!sectors || sectors.length == 0) {
        const err = new Error('No sector found');
        err.status = 404;
        throw err;
    }
    console.log(`${sectors.length} sectors found`);
    return sectors;
};

async function change_sector(mentor_id, names) {
    const {old_name, new_name} = names;
    const result = await mentor_sector_repository.get_sector(mentor_id, old_name);
    if(!result) {
        const err = new Error('Sector not found');
        err.status = 404;
        throw err;
    }
    const name = await mentor_sector_repository.change_sector(mentor_id, old_name, new_name);
    if(!name) {
        const err = new Error('Failed to update sector');
        err.status = 500;
        throw err;
    }
    console.log(`${old_name} sector changed to ${new_name}`);
    return name;
};

async function remove_sector(mentor_id, old_name) {
    const {sector_name} = old_name
    const result = await mentor_sector_repository.get_sector(mentor_id, sector_name);
    if(!result) {
        const err = new Error('Sector not found');
        err.status = 404;
        throw err;
    }
    const verify = await mentor_sector_repository.remove_sector(mentor_id, sector_name);
    if(!verify) {
        const err = new Error('Failed to remove sector');
        err.status = 500;
        throw err;
    }
    console.log(`${old_name} sector removed`);
    return verify;
};

module.exports = {
    add_sector,
    get_sectors,
    change_sector,
    remove_sector
};