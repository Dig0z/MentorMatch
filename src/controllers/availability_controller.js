const express = require('express');
const router = express.Router();
const availability_service = require('../services/availability_service.js');
const auth = require('../middleware/auth_middleware.js');
const validate = require('../dtos/dto_middleware.js');
const add_availability_dto = require('../dtos/mentor_availability/add_availability_dto.js');
const remove_availability_dto = require('../dtos/mentor_availability/remove_availability_dto.js');

router.post('/add_availability', validate(add_availability_dto), auth, async (req, res) => {
    const mentor_id = req.user.id;
    const result = await availability_service.add_availability(mentor_id, req.body);
    const {id, weekday, start_time, end_time} = result;
    return res.status(201).json({
        message: 'Availability added',
        success: true,
        data: id, weekday, start_time, end_time
    });
});

router.get('/get_availabilities', auth, async (req, res) => {
    const mentor_id = req.user.id;
    const dates = await availability_service.get_availabilities(mentor_id, req.body);
    res.status(200).json({
        message: 'All dates fetched',
        success: true,
        data: dates
    });
});

router.delete('/remove_availability', validate(remove_availability_dto), auth, async (req, res) => {

});

router.delete('/remove_all_availability', auth, async (req, res) => {
    
});

module.exports = router;