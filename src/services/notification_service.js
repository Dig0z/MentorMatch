const notification_repository = require('../repositories/notification_repository.js');

async function send_notification(user_id, message) {
    const notification = await notification_repository.send_notification(user_id, message);
    console.log(`Notification correctly sent`);
    return notification;
}

async function fetch_notifications(user_id) {
    const notifications = await notification_repository.fetch_notifications(user_id);
    if(!notifications) {
        const err = new Error('You have no notifications');
        err.status = 404;
        throw err;
    }
    console.log(`${notifications.length} notifications found`);
    return notifications;
}

async function delete_notification(id, user_id) {
    const result = await notification_repository.delete_notification(id, user_id);
    if(!result) {
        const err = new Error('Notification not found');
        err.status(404);
        throw err;
    }
    console.log(`Notification removed`);
    return result;
}

async function delete_all(user_id) {
    const notifications = await notification_repository.delete_all(user_id);
    if(!notifications) {
        const err = new Error('No notification found');
        err.status = 404;
        throw err;
    }
    console.log(`${notifcations.length} notifications removed`);
    return result;
}

module.exports = {
    send_notification,
    fetch_notifications,
    delete_notification,
    delete_all
}