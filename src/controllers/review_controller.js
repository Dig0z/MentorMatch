const express = require('express');
const router = express.Router();
const review_service = require('../services/review_service.js');
const auth = require('../middlewares/auth_middleware.js');
const validate = require('../middlewares/dto_middleware.js');
const review_params_dto = require('../dtos/review/review_params_dto.js');
const add_review_body_dto = require('../dtos/review/add_review_body_dto.js');

router.post('/add_review/:mentor_email', validate(review_params_dto, 'params'), validate(add_review_body_dto), auth, async (req, res) => {
    const mentee_id = req.user.id;
    const review = await review_service.add_review(mentee_id, req.params, req.body);
    const {mentor_email, rating, comment} = review;
    res.status(201).json({
        message: 'Review added',
        success: true,
        data: {
            mentor_email,
            rating,
            comment
        }
    });
});

router.get('/get_reviews/:mentor_email', validate(review_params_dto, 'params'), async (req, res) => {
    const reviews = await review_service.get_reviews(req.params);
    res.status(200).json({
        message: `${reviews.length} reviews found`,
        success: true,
        data: reviews
    });
});

module.exports = router;