function validate_dto(dto) {

    // Ritorna una funzione middleware che riceve (req, res, next)
    return (req, res, next) => {
        const payload = req.body;
        //invece di mandare subito l'errore, si salvano tutti man mano
        //in un vettore e si stampano tutti insieme alla fine del check
        const errors = [];

        for(let i in dto) {
            const check = dto[i];
            const value = payload[i];

            if(check.required && (value == null || value == undefined || (typeof value === 'string' && value.length < 1))) {
                errors.push({
                    status: 400,
                    message: `Missing ${i}`
                });
            }

            if(check.max_length && value && value.length > check.max_length) {
                errors.push({
                    status: 400, 
                    message: `${i} max length is ${check.max_length}`
                });
            }

            if(check.min_length && value && value.length < check.min_length) {
                errors.push({
                    status: 400,
                    message: `${i} min length is ${check.min_length}`
                });
            }

            if(check.pattern && value && !check.pattern.test(value)) {
                errors.push({
                    status: 400,
                    message: `Wrong pattern in ${i}`
                });
            }

            if(check.accepted_values && value && !check.accepted_values.includes(value)) {
                let ac_val = '';
                for(v in check.accepted_values)
                    ac_val += '\n' + check.accepted_values[v];
                errors.push({
                    status: 400,
                    message: `${i} value must be one of the following: ${ac_val}`
                });
            }
        }

        if(errors.length > 0) {
            const err = new Error('Incorrect request');
            err.status = 400;
            err.details = errors;
            return next(err);
        }

        next();
    };
};

module.exports = validate_dto;