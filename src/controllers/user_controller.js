const express = require('express');
const router = express.Router();
const user_service = require('../services/user_service.js');
const auth = require('../middleware/auth_middleware.js');
const validate = require('../middleware/dto_middleware.js');
const register_dto = require('../dtos/user/register_dto.js');
const login_dto = require('../dtos/user/login_dto.js');
const get_mentors_dto = require('../dtos/user/get_mentors_dto.js');
const {update_name_dto, update_surname_dto, update_bio_dto, update_photo_url_dto} = require('../dtos/user/update_user_data_dto.js');

router.get('/test', async(req, res) => {
    res.status(201).json({message: 'Endpoint works'});
})

router.post('/register', validate(register_dto), async (req, res) => {
    const {user, token} = await user_service.register(req.body);
    res.status(201).json({
        message: 'User succesfully created',
        success: true,
        data: {user, token}
    });
});

router.post('/login', validate(login_dto), async (req, res) => {
    const payload = await user_service.login(req.body);
    const {valid, token} = payload;
    if(valid) {
        res.status(200).json({
            message: 'Login succesful',
            success: valid,
            data: {token}
        });
    }
});

router.get('/get_mentors', validate(get_mentors_dto, 'query'), async (req, res) => {
    const mentor_list = await user_service.get_mentors(req.query);
    res.status(200).json({
        message: `${mentor_list.length} mentors found`,
        success: true,
        data: mentor_list
    });
});

router.patch('/update_name', validate(update_name_dto, 'params'), validate(update_name_dto, 'body'), auth, async (req, res) => {
    const user_id = req.user.id;
    const {name} = await user_service.update_name(user_id, req.body);
    res.status(200).json({
        message: 'Name changed',
        success: true,
        data: {name}
    });
});

router.patch('/update_surname', validate(update_surname_dto, 'params'), validate(update_surname_dto, 'body'), auth, async (req, res) => {
    const user_id = req.user.id;
    const {surname} = await user_service.update_surname(user_id, req.body);
    res.status(200).json({
        message: 'Surname changed',
        success: true,
        data: {surname}
    });
});

router.patch('/update_bio', validate(update_bio_dto, 'params'), validate(update_bio_dto, 'body'), auth, async (req, res) => {
    const user_id = req.user.id;
    const {bio} = await user_service.update_email(user_id, req.body);
    res.status(200).json({
        message: 'Bio changed',
        success: true,
        data: {bio}
    });
});

router.patch('/update_photo_url', validate(update_photo_url_dto, 'params'), validate(update_photo_url_dto, 'body'), auth, async (req, res) => {
    const user_id = req.user.id;
    const {photo_url} = await user_service.update_name(user_id, req.body);
    res.status(200).json({
        message: 'Profile pic changed',
        success: true,
        data: {photo_url}
    });
});


module.exports = router;
