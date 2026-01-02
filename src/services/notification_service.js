const notification_repository = require('../repositories/notification_repository.js');

async function send_notification(user_id, message) {
    return await notification_repository.send_notification(user_id, message);
}

async function fetch_notifications(user_id) {
    const result = await notification_repository.fetch_notifies(user_id);
    if(!result)
        result = 'No notifications'
    return result;
}

module.exports = {
    send_notification,
    fetch_notifications
}