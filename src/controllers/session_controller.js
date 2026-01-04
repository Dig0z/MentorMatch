const express = require('express');
const router = express.Router();
const session_service = require('../services/session_service.js');
const auth = require('../middlewares/auth_middleware.js');
const google = require('../middlewares/google.js');
const validate = require('../middlewares/dto_middleware.js');
const book_session_dto = require('../dtos/session/book_session_dto.js');

router.post('/book_session', validate(book_session_dto), auth, async (req, res) => {
    const mentee_id = req.user.id;
    const session = await session_service.book_session(mentee_id, req.body);
    const {id, start_datetime, end_datetime, status} = session;
    res.status(201).json({
        message: `Session booked on ${start_datetime}`,
        success: true,
        data: {
            id,
            start_datetime,
            end_datetime,
            status
        }
    });
});

router.get('/confirm_booking/:id', validate(confirm_booking_dto, 'params'), auth, async (req, res) => {
    const mentor_id = req.user.id;
    const result = await session_service.confirm_booking(mentor_id, req.params);
});

module.exports = router;