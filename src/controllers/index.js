const { add_availability } = require('../repositories/availability_repository');

module.exports = {
    user_controller: require('./user_controller'),
    availability_controller: require('./availability_controller')
}