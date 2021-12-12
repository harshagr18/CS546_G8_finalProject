(function ($) {})(jQuery);

function updateUserValidation(event) {
  let username = $("#username").val();
  let password = $("#password").val();
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
