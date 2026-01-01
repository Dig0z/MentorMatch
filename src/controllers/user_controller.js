const express = require('express');
const router = express.Router();
const user_service = require('../services/user_service.js');
const validate = require('../dtos/dto_middleware.js');
const register_dto = require('../dtos/user/register_dto.js');
const login_dto = require('../dtos/user/login_dto.js');

router.get('/test', async(req, res) => {
    res.status(201).json({message: 'Endpoint works'});
})

router.post('/register', validate(register_dto), async (req, res) => {
    const {user, token} = await user_service.register(req.body);
    res.status(201).json({
        message: 'User succesfully created',
        success: true,
        data: user, token
    });
});

router.post('/login', validate(login_dto), async (req, res) => {
    const payload = await user_service.login(req.body);
    const {valid, token} = payload;
    if(valid) {
        res.status(200).json({
            message: 'Login succesful',
            success: valid,
            data: token
        });
    }
});


module.exports = router;
