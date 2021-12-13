(function ($) {
  let errormsg = $("#login-error");
  errormsg.hide();

  $("#loginbtn").click(function (event) {
    event.preventDefault();
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
    var requestConfig = {
      method: "POST",
      url: location.href,
      data: { username: username, password: password },
    };

    $.ajax(requestConfig)
      .then(function (res) {
        debugger;
        console.log(res);
        window.location.replace("/");
      })
      .fail(function (error) {
        errormsg.show();
        errormsg.html(error.responseJSON.error);
      });
  });
})(jQuery);
