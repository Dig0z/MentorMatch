const express = require('express');
const router = express.Router();
const user_service = require('../services/user_service.js');

router.post('/register', async (req, res, next) => {
    const {user, token} = await user_service.register(req.body);
    res.status(201).json({
        message: 'User succesfully created',
        success: true,
        data: user, token
    });
});

router.post('/login', async (req, res, next) => {
    const result = user_service.login(req.body);
    res.status(200).json({
        message: 'Login succesful',
        success: true,
        data: result
    });
});


module.exports = router;
