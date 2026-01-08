const update_name_dto = {
    name: {
        required: true
    }
};

const update_surname_dto = {
    surname: {
        required: true
    }
};

const update_bio_dto = {
    bio: {
        required: true
    }
};

const update_photo_url_dto = {
    photo_url: {
        required: true,
        pattern: /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i
    }
};

module.exports = {
    update_name_dto,
    update_surname_dto,
    update_bio_dto,
    update_photo_url_dto
};