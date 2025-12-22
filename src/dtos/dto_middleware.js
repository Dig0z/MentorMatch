function validate_dto(dto, req, res, next) {
    const payload = req.body;
    //invece di mandare subito l'errore, si salvano tutti man mano
    //in un vettore e si stampano tutti insieme alla fine del check
    const errors = [];

    for(i in dto) {
        check = dto[i];
        value = payload[i];

        if(check.required && (value == null || value == undefined || value.length < 1))
            errors.push(new Error(`Missing ${i}`));

        if(check.max_length && value.length > check.max_length)
            errors.push(new Error(`${i} max length is ${check.max_length}`));

        if(check.min_length && value.length < check.min_length)
            errors.push(new Error(`${i} min length is ${check.min_length}`));

        if(check.pattern && !check.pattern.test(value))
            errors.push(new Error(`Wrong pattern in ${i}`));

        if(check.accepted_values && !check.accepted_values.includes(value)) {
            let ac_val = '';
            for(v in check.accepted_values)
                ac_val += '\n' + check.accepted_values[v];
            errors.push(new Error(`${i} value must be one of the following: ${ac_val}`));
        }

        if(errors.length > 0) {
            for(i in errors)
                throw new Error(errors[i].toString());
        }

        next();

    }
};

module.exports = {validate_dto};