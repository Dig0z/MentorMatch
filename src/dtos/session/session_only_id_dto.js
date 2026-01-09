const session_only_id_dto = {
    id: {
        required: true,
        pattern: /^\d+$/,
        type: 'number'
    }
};

module.exports = session_only_id_dto;