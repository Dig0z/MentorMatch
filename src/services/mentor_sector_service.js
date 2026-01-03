const mentor_sector_repository = require('../repositories/mentor_sector_repository.js');

async function add_sector(mentor_id, sector_name) {
    const name = await mentor_sector_repository.add_sector(mentor_id, sector_name);
    if(!name || name.length == 0) {
        const err = new Error('Failed to add sector');
        err.status = 500;
        throw err;
    }
    return name;
};

async function get_sectors(mentor_id) {
    const sectors = await mentor_sector_repository.get_sectors(mentor_id);
    if(!sectors || sectors.length == 0) {
        const err = new Error('No sector found');
        err.status = 404;
        throw err;
    }
    return sectors;
};

async function change_sector(mentor_id, old_name, new_name) {
    const sectors = await mentor_sector_repository.get_sectors(mentors_id);
    const verify_update = await mentor_sector_repository.change_sector(mentor_id, old_name, new_name);
    //da finire
};

async function remove_sector(mentor_id, sector_name) {
    const sectors = await mentor_sector_repository.get_sectors(mentors_id);
};

module.exports = {
    add_sector,
    get_sectors,
    change_sector,
    remove_sector
};