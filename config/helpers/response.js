// helpers/response.js

const success = (res, message = 'Success', data = null, code = 200) => {
    return res.status(code).json({
        success: true,
        message,
        data,
    });
};


const error = (res, message = 'Error', error = null, code = 500) => {
    console.error('❌ Response error helper:', error);

    return res.status(code).json({
        success: false,
        message,
        error: error instanceof Error ? error.message : error,
    });
};


module.exports = {
    success,
    error
};
