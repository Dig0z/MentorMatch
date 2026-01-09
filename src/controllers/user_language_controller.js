const express = require('express');
const router = express.Router();
const service = require('../services/user_language_service');
const auth = require('../middlewares/auth_middleware');
const validate = require('../middlewares/dto_middleware');
const add_remove_language_dto = require('../dtos/user_languages/add_remove_language_dto');

router.post('/add_language', validate(add_remove_language_dto), auth, async (req, res) => {
  const user_id = req.user.id;
  const {language_name} = await service.add_language(user_id, req.body);
  res.status(201).json({
    message: 'Language added',
    success: true,
    data: {language_name}
  });
});

router.get('/get_languages', auth, async (req, res) => {
  const user_id = req.user.id;
  const languages = await service.get_languages(user_id);
  res.status(200).json({
    message: `Found ${languages.length} languages`,
    success: true,
    data: {languages}
  });
});

router.delete('/remove_language', validate(add_remove_language_dto), auth, async (req, res) => {
  const user_id = req.user.id;
  const {language_name} = await service.remove_language(user_id, req.body);
  res.status(200).json({
    message: `Language ${language_name} removed`,
    success: true,
    data: {language_name}
  });
});

module.exports = router;