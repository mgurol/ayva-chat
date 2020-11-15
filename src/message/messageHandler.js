var enums = require('../enums');
var messages = require('./messages');

function enumToText(enumValue) {
    var message = {
        httpCode: enums.HTTP_CODES.OK,
        errorCode : enums.DB_CODES.OK,
        text: 'OK'
    };

    switch (enumValue) {
        case enums.DB_CODES.ALREADY_EXISTS:
            message.httpCode = enums.HTTP_CODES.ERROR;
            message.errorCode = enums.DB_CODES.ALREADY_EXISTS;
            message.text = messages.messageTexts.USER_ALREADY_EXISTS;
            break;
        case enums.CACHE_CODES.USER_ALREADY_LOGGED_IN:
            message.httpCode = enums.HTTP_CODES.ERROR;
            message.errorCode = enums.CACHE_CODES.USER_ALREADY_LOGGED_IN;
            message.text = messages.messageTexts.USER_ALREADY_LOGGED_IN;
            break;
        case enums.DB_CODES.NOT_FOUND:
            message.httpCode = enums.HTTP_CODES.ERROR;
            message.errorCode = enums.DB_CODES.NOT_FOUND;
            message.text = messages.messageTexts.USER_NOT_FOUND;
            break;
        default:
            break;
    }

    return message;
}

module.exports.enumToText = enumToText;