const notification_repository = require('../repositories/notification_repository.js');

async function send_notification(user_id, message) {
    return await notification_repository.send_notification(user_id, message);
}

async function fetch_notifications(user_id) {
    const result = await notification_repository.fetch_notifications(user_id);
    if(!result)
        result = 'No notification';
    return result;
}

async function delete_notification(id, user_id) {
    const result = await notification_repository.delete_notification(id, user_id);
    if(!result) {
        const err = new Error('Notification not found');
        err.status(404);
        throw err;
    }
    return result;
}

async function delete_all(user_id) {
    const result = await notification_repository.delete_all(user_id);
    if(!result) {
        result = 'No notification to delete';
    }
    return result;
}

module.exports = {
    send_notification,
    fetch_notifications,
    delete_notification,
    delete_all
}