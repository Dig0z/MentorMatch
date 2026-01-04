const express = require('express');
const router = express.Router();
const mentor_sector_service = require('../services/mentor_sector_service.js');
const auth = require('../middlewares/auth_middleware.js');
const validate = require('../middlewares/dto_middleware.js');
const add_remove_sector_dto = require('../dtos/mentor_sector/add_remove_sector_dto.js');
const change_sector_dto = require('../dtos/mentor_sector/change_sector_dto.js');

router.post('/add_sector', validate(add_remove_sector_dto), auth, async (req, res) => {
    const mentor_id = req.user.id;
    const {sector_name} = await mentor_sector_service.add_sector(mentor_id, req.body);
    res.status(201).json({
        message: 'Sector added',
        success: true,
        data: {sector_name}
    });
});

router.get('/get_sectors', auth, async (req, res) => {
    const mentor_id = req.user.id;
    const sectors = await mentor_sector_service.get_sectors(mentor_id);
    res.status(200).json({
        message: `Found ${sectors.length} sectors`,
        success: true,
        data: {sectors}
    });
});

router.patch('/change_sector', validate(change_sector_dto), auth, async (req, res) => {
    const mentor_id = req.user.id;
    const {sector_name} = await mentor_sector_service.change_sector(mentor_id, req.body);
    res.status(200).json({
        message: `Sector name changed to ${sector_name}`,
        success: true,
        data: {sector_name}
    });
});

router.delete('/remove_sector', validate(add_remove_sector_dto), auth, async (req, res) => {
    const mentor_id = req.user.id;
    const {sector_name} = await mentor_sector_service.remove_sector(mentor_id, req.body);
    res.status(200).json({
        message: `Sector ${sector_name} removed`,
        success: true,
        data: {sector_name}
    });
});

module.exports = router;