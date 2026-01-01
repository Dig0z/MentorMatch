const register_dto = {
    name: {
        required: true,
        max_length: 35   //standard dell'UK Government Data Standards Catalogue
    },
    surname: {
        required: true,
        max_length: 35
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        required: true,
        min_length: 8,
        max_length: 128,
        //deve contenere almeno una minuscola, almeno una maiuscola, almeno un simbolo tra quelli elencati, e nessuno spazio
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[()|!"£$%&/=?^\\è+òàù;:\-.\é*ç°§ \[\] @#{}€])(?!.*\s).+$/
    },
    role: {
        required: true,
        accepted_values: ["mentor", "mentee"]
    },
    bio: {
        required: false,
        max_length: 256
    },
    photo_url: {
        required: false,
        pattern: /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i
    }
}

module.exports = register_dto;