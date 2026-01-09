function handle_error(err, req, res, next) {
    console.error(err);

    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    const details = err.details || null;

    
    res.status(status).json({
        'success': false,
        'error': {
            'status': status,
            'message': message,
            'details': details || message
        }
    });
}

module.exports = handle_error;