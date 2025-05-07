// helpers/response.js

const success = (res, message = 'Success', data = null, code = 200) => {
    return res.status(code).json({
        success: true,
        message,
        data,
    });
};

const error = (res, message = 'Error', code = 500, error = null) => {
    return res.status(code).json({
        success: false,
        message,
        error,
    });
};

module.exports = {
    success,
    error
};
