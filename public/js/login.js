const { parseTwoDigitYear } = require("moment");
const { use } = require("../../routes/users");

(function ($) {})(jQuery);

function createUserValidation(event) {
  event.preventDefault();
  let username = $("#username").val();
  let password = $("#password").val();

  var requestConfig = {
    method: "POST",
    url: "/users/login",
    data: { username: username, password: password },
  };

  $.ajax(requestConfig).then(function (responseMessage) {
    var newElement = $(responseMessage);
    window.location.replace("/");
  });

  if (username.trim().length == 0) {
    $("#uiError").show();
    $("#uiError").html("Please Enter Username");
    return false;
  } else if (password.trim().length == 0) {
    $("#uiError").show();
    $("#uiError").html("Please Enter Password");
    return false;
  }
  return true;
}
