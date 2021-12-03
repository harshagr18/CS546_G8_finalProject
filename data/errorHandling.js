const { ObjectId } = require('mongodb');

function checkId(id) {
    if (!id || typeof id !== 'string' || !id.trim().replace(/\s/g, "").length) {
        return false;
        throw 'You must provide valid input for your review';
    }

    if(!ObjectId.isValid(id)) {
        throw 'The ID is not a valid Object ID';
        return false;
    }
    return true;
}

function checkString(str) {
    if(!str || typeof str !== 'string' || !str.trim().replace(/\s/g, "").length) {
        return false;
    }
    return true;
}

function checkRating(num) {
    if(!num || typeof num !== 'number' || !Number.isInteger(num) || num < 1 || num > 5) {
        return false;
    }
    return true;
}

function checkDate(date) {
    let pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    return pattern.test(date.trim());
}

module.exports = {
    checkId,
    checkString,
    checkRating,
    checkDate
}