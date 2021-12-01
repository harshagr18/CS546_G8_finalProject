(function ($) {
  //error functions

  let error = $(".error");
  //edit parkings
  $("#editParkings").click(function (e) {
    e.preventDefault();
    let parkingId = $("#parkingID").val();
    let requestConfig = {
      method: "PUT",
      url: window.location.href + "/" + parkingId,
    };
    $.ajax(requestConfig).then(function (response) {
      console.log(response);
    });
  });

  //   $("#createParkings").click(function (e) {
  //     e.preventDefault();
  //     let requestConfig = {
  //       method: "GET",
  //       url: window.location.href + "/create",
  //     };
  //     $.ajax(requestConfig).then(function (response) {});
  //   });

  //   $("#btnMainSearch").click(function (e) {
  //     error.hide();
  //     e.preventDefault();
  //     let mainSearch = $("#mainSearch").val();
  //     if (mainSearch.trim().length === 0) {
  //       error.show();
  //       error.html("Search box cannot be empty");
  //     }
  //     let result = checkAlphanumerics(mainSearch);
  //     if (result) {
  //       error.show();
  //       error.html("Search only accepts alphanumeric");
  //     }
  //     let searchParams = new URLSearchParams(window.location.search);
  //     console.log(searchParams.has("mainSearch"));

  //     let requestConfig = {
  //       method: "GET",
  //       url: location.href,
  //     };
  //   });
})(jQuery);

function checkAlphanumerics(phrase) {
  let str = phrase;
  const checker = /[^a-z0-9]/g;
  if (checker.test(str)) {
    return true;
  }

  return false;
}
