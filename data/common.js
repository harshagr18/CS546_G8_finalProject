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

function checkIsProperString(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "string") {
    throw `Not a string`;
  }

  if (val.length == 0) {
    throw `Length of string is 0`;
  }
  if (val.trim().length == 0) {
    throw `String is only spaces`;
  }
}

function checkIsProperBoolean(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "boolean") {
    throw `Not a string`;
  }
}

function checkIsProperNumber(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "number") {
    throw `Not a string`;
  }
}

function checkInputDate(dateString) {
    if (!dateString) {
        throw `No input passed`;
    }
    // Current date
    // Reference: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript?rq=1
    var today = new Date();
    var dd = parseInt(String(today.getDate()).padStart(2, "0"));
    var mm = parseInt(String(today.getMonth() + 1).padStart(2, "0")); //January is 0!
    var yyyy = today.getFullYear();
  
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) throw `Date is not in proper format.`;
  
    // Parse the date parts to integers
    var parts = dateString.split("/");

    if (typeof parts[0] == 'undefined' && typeof parts[1] == 'undefined' && typeof parts[2] == 'undefined') {
        throw `Date is undefined.`;
    } else if(isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        throw `Not an Number.`;
    }
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);
  
    if (year < yyyy)
        throw `Older year than current.`
    else if(year == yyyy && month < mm)
        throw `Older month than current.`;
    else if(month == mm && day < dd)
        throw `Older date than current.`
  
    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) throw `Invalid month or year.`;
  
    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;
  
    // Check the range of the day
    if(day > 0 && day <= monthLength[month - 1]) throw `Invalid day.`;
  }

  function checkInputTime(times) {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(times);
    if (!isValid) throw `Invalid time.`;
  }
  
module.exports = {
  checkIsProperString,
  checkIsProperNumber,
  checkIsProperBoolean,
  checkInputDate,
  checkInputTime
};
