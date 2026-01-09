const express = require('express');
const router = express.Router();
const session_service = require('../services/session_service.js');
const auth = require('../middlewares/auth_middleware.js');
const validate = require('../middlewares/dto_middleware.js');
const asyncHandler = require('../middlewares/async_handler');
const book_session_dto = require('../dtos/session/book_session_dto.js');
const session_only_id_dto = require('../dtos/session/session_only_id_dto.js');


router.post('/book_session', validate(book_session_dto), auth, asyncHandler(async (req, res) => {
    const mentee_id = req.user.id;
    const session = await session_service.book_session(mentee_id, req.body);
    const {id, start_datetime, end_datetime, status} = session;
    res.status(201).json({
        message: `Session booked on ${start_datetime}`,
        success: true,
        data: { id, start_datetime, end_datetime, status }
    });
}));

router.get('/confirm_booking/:id', validate(session_only_id_dto, 'params'), auth, asyncHandler(async (req, res) => {
    const mentor_id = req.user.id;
    const result = await session_service.confirm_booking(mentor_id, req.params);
    const {id, start_datetime, end_datetime, status, meeting_link} = result;
    res.status(200).json({
        message: `Session confirmed on ${start_datetime}. Meeting link: ${meeting_link}`,
        success: true,
        data: { id, start_datetime, end_datetime, status, meeting_link }
    });
}));

router.patch('/cancel_session/:id', validate(session_only_id_dto, 'params'), auth, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const result = await session_service.cancel_session(user_id, req.params);
    const {id, start_datetime, end_datetime, status} = result;
    res.status(200).json({
        message: 'Session cancelled',
        success: true,
        data: { id, start_datetime, end_datetime, status }
    });
}));

router.delete('/confirm_cancellation/:id', validate(session_only_id_dto, 'params'), auth, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const deleted_session = await session_service.confirm_cancellation(user_id, req.params);
    const {start_datetime, end_datetime, status} = deleted_session;
    res.status(200).json({
        message: 'Session cancelled',
        success: true,
        data: { start_datetime, end_datetime, status }
    });
}));

router.get('/get_sessions', auth, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const sessions = await session_service.get_user_sessions(user_id);
    res.status(200).json({
        message: `${sessions.length} booked sessions found`,
        success: true,
        data: sessions
    }); 
}));

module.exports = router;