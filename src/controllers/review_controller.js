const express = require('express');
const router = express.Router();
const review_service = require('../services/review_service.js');
const auth = require('../middlewares/auth_middleware.js');
const validate = require('../middlewares/dto_middleware.js');
const add_review_params_dto = require('../dtos/review/add_review_params_dto.js');
const add_review_body_dto = require('../dtos/review/add_review_body_dto.js');
const { mentor_email } = require('../dtos/session/book_session_dto.js');

router.post('/add_review/:mentor_email', validate(add_review_params_dto, 'params'), validate(add_review_body_dto), auth, async (req, res) => {
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

module.exports = router;