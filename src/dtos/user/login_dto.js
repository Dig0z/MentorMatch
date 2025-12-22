const login_dto = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        required: true,
        min_length: 8,
        max_length: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[()|!"£$%&/=?^\\è+òàù;:\-.\é*ç°§ \[\] @#{}€])(?!.*\s).+$/
    }
};

module.exports = login_dto;