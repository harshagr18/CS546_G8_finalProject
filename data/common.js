// function checkIsProperString(val, typeData) {
//   if (!val) {
//     throw `No input passed`;
//   }
//   if (typeof val !== typeData) {
//     throw `Not a string`;
//   }

//   if (val.length == 0) {
//     throw `Length of string is 0`;
//   }
//   if (val.trim().length == 0) {
//     throw `String is only spaces`;
//   }
// }

function convertObjectIdToString(obj) {
  obj._id = obj._id.toString();
  return obj;
}

function checkObjectId(id) {
  checkIsProperString(id);
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) !== id) throw `Object Id not valid string: ${val}`;
  } else {
    throw `Object Id not valid: ${val}`;
  }
}

function checkIsProperString(val) {
  if (!val) {
    throw `No input passed: ${val}`;
  }
  if (typeof val !== "string") {
    throw `Not a string: ${val}`;
  }

  if (val.length == 0) {
    throw `Length of string is 0: ${val}`;
  }
  if (val.trim().length == 0) {
    throw `String is only spaces: ${val}`;
  }
}

function checkIsProperBoolean(val) {
  if (!val) {
    throw `No input passed: ${val}`;
  }
  if (typeof val !== "boolean") {
    throw `Not a string: ${val}`;
  }
}

function checkIsProperNumber(val) {
  if (!val) {
    throw `No input passed: ${val}`;
  }
  if (typeof val !== "number") {
    throw `Not a number: ${val}`;
  }
}

function checkInputDate(dateString) {
    if (!dateString) {
        throw `No input passed: ${val}`;
    }
    // Current date
    // Reference: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript?rq=1
    var today = new Date();
    var dd = parseInt(String(today.getDate()).padStart(2, "0"));
    var mm = parseInt(String(today.getMonth() + 1).padStart(2, "0")); //January is 0!
    var yyyy = today.getFullYear();
  
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) throw `Date is not in proper format: ${val}`;
  
    // Parse the date parts to integers
    var parts = dateString.split("/");

    if (typeof parts[0] == 'undefined' && typeof parts[1] == 'undefined' && typeof parts[2] == 'undefined') {
        throw `Date is undefined: ${val}`;
    } else if(isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        throw `Not an Number: ${val}`;
    }
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);
  
    if (year < yyyy)
        throw `Older year than current: ${val}`
    else if(year == yyyy && month < mm)
        throw `Older month than current: ${val}`;
    else if(month == mm && day < dd)
        throw `Older date than current: ${val}`
  
    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) throw `Invalid month or year: ${val}`;
  
    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;
  
    // Check the range of the day
    // if(day > 0 && day <= monthLength[month - 1]) throw `Invalid day.`;
  }

  function checkInputTime(times) {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(times);
    if (!isValid) throw `Invalid time: ${val}`;
  }

function checkNumberPlate(val) {
    checkIsProperString(val);
    let re = /[^a-z0-9\s]/gi;
    if(re.test(val)) throw `Number plate should be alpanumeric: ${val}`;
  }

module.exports = {
  checkIsProperString,
  checkIsProperNumber,
  checkIsProperBoolean,
  checkInputDate,
  checkInputTime,
  checkNumberPlate,
  convertObjectIdToString,
  checkObjectId
};
