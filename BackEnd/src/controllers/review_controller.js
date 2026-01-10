const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth_middleware');
const validate = require('../middlewares/dto_middleware');
const asyncHandler = require('../middlewares/async_handler');
const add_review_dto = require('../dtos/review/add_review_dto');
const get_reviews_query_dto = require('../dtos/review/get_reviews_query_dto');
const review_service = require('../services/review_service');

router.post('/add_review', validate(add_review_dto), auth, asyncHandler(async (req, res) => {
    const mentee_id = req.user.id;
    const saved = await review_service.add_review(mentee_id, req.body);
    res.status(201).json({
        message: 'Review added',
        success: true,
        data: saved
    });
}));

router.get('/get_reviews', validate(get_reviews_query_dto, 'query'), asyncHandler(async (req, res) => {
    const { email, last_id, limit } = req.query;
    const list = await review_service.get_reviews_by_email(email, last_id, limit);
    res.status(200).json({
        message: `${list.length} reviews found`,
        success: true,
        data: list
    });
}));

module.exports = router;
