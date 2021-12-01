(function ($) {
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
})(jQuery);
