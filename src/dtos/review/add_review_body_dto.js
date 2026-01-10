const add_review_body_dto = {
    rating: {
        required: true,
        type: 'number',
        min: 1,
        max: 5
    },
    comment: {
        required: false     //il middleware sa che un eventuale campo comment 
                            //non è obbligatorio, ma accettabile
    } 
};

module.exports = add_review_body_dto;