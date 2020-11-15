const HTTP_CODES = {
    ERROR: 400,
    OK: 200
}

const DB_CODES = {
    ALREADY_EXISTS: 10100,
    NOT_FOUND: 10404,
    OK: 10000
}

const CACHE_CODES = {
    USER_ALREADY_LOGGED_IN: 20004
}

module.exports.HTTP_CODES = HTTP_CODES;
module.exports.DB_CODES = DB_CODES;
module.exports.CACHE_CODES = CACHE_CODES;