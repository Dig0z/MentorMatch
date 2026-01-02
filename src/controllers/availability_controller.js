const express = require('express');
const router = express.Router();
const availability_service = require('../services/availability_service.js');
const auth = require('../middleware/auth_middleware.js');
const validate = require('../dtos/dto_middleware.js');
const add_availability_dto = require('../dtos/mentor_availability/add_availability_dto.js');

router.post('/add_availability', validate(add_availability_dto), auth, async (req, res) => {
    const mentor_id = req.user.id;
    const result = await availability_service.add_availability(mentor_id, req.body);
    return res.status(201).json({
        message: 'Availability added',
        success: true,
        data: result
    });
});

module.exports = router;