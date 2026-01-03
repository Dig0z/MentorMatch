function validate_dto(dto, source = 'body') {

    // Ritorna una funzione middleware che riceve (req, res, next)
    return (req, res, next) => {
        const payload = req[source];
        if(source == 'query' && !payload) {
            //se non ci sono query params, non c'è niente da validare
            next();
            return;
        }
        console.log(payload);
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

            if(check.type) {
                if(check.type == 'number') {
                    if(typeof Number(value) != 'number') {
                        errors.push({
                            status: 400,
                            message: `${i} must be a ${check.type}`
                        });
                    }
                    if(check.min && Number(value) < check.min) {
                        errors.push({
                            status: 400,
                            message: `${i} value must be greater than ${check.min}`
                        });
                    }
                    if(check.max && Number(value) > check.max) {
                        errors.push({
                            status: 400,
                            message: `${i} value must be smaller than ${check.min}`
                        });
                    }
                }
                if(check.type == 'date') {
                    const year = Number(value.split('-')[0]);
                    const month = Number(value.split('-')[1]);
                    const day = Number(value.split('-')[2]);
                    const verify_date = new Date(year, month-1, day);
                    if(day != verify_date.getDate()) {
                        errors.push({
                            status: 400,
                            message: 'Day is not valid'
                        });
                    }
                    if(month != verify_date.getMonth()+1) {
                        errors.push({
                            status: 400,
                            message: 'Month is not valid'
                        });
                    }
                    if(check.min && check.min == 'tomorrow') {
                        const now = new Date();
                        if(year <= now.getFullYear() && month <= now.getMonth()+1 && day <= now.getDate()) {
                            errors.push({
                                status: 400,
                                message: 'Date must start from tomorrow'
                            });
                        }
                    }
                }
                if(check.type == 'time') {
                    const hour = Number(value.split(':')[0]);
                    const minute = Number(value.split(':')[1]);
                    if(hour < 0 || hour > 23) {
                        errors.push({
                                status: 400,
                                message: `${i} must be beetween 00:00 and 23:59`
                            });
                    }
                    if(minute < 0 || minute > 59) {
                        errors.push({
                                status: 400,
                                message: `${i} must be beetween 00:00 and 23:59`
                            });
                    }
                }
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